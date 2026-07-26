"""
ETL - People Analytics J&T Express
Extrai a base bruta, limpa e organiza em modelo estrela (dim/fato).

Uso: python build_star_schema.py
Entrada:  ../data/raw/People Analytics - J&T Express.csv
          ../data/raw/People Analytics - J&T Express - serie_mensal.csv
          (gerado por generate_serie_mensal_raw.py)
Saida:    ../data/processed/dim_colaborador.csv
          ../data/processed/dim_departamento.csv
          ../data/processed/dim_cargo.csv
          ../data/processed/fato_rh.csv
          ../data/processed/fato_rh_mensal.csv  (serie mensal agregada do painel colaborador x mes)
"""
import pandas as pd

RAW_PATH = "../data/raw/People Analytics - J&T Express.csv"
RAW_SERIE_MENSAL_PATH = "../data/raw/People Analytics - J&T Express - serie_mensal.csv"
OUT_DIR = "../data/processed"

# ---------------------------------------------------------------------------
# 1. EXTRACAO
# ---------------------------------------------------------------------------
df = pd.read_csv(RAW_PATH, encoding="utf-8")

# ---------------------------------------------------------------------------
# 2. LIMPEZA
# ---------------------------------------------------------------------------

# 2.1 duplicatas exatas (linha inteira) e por chave primaria
n_before = len(df)
df = df.drop_duplicates()
df = df.drop_duplicates(subset=["id_colaborador"], keep="first")
assert len(df) == n_before, "duplicatas removidas"  # nao deve remover nada (ja verificado: 0 duplicatas)

# 2.2 numeros com virgula decimal -> ponto (padrao BR no CSV de origem)
for col in ["tempo_empresa", "absenteismo", "nota_desempenho"]:
    df[col] = df[col].astype(str).str.replace(",", ".", regex=False).astype(float)

# 2.3 datas
df["data_admissao"] = pd.to_datetime(df["data_admissao"])

# 2.4 strings: strip de espacos acidentais
str_cols = df.select_dtypes(include="object").columns
for col in str_cols:
    df[col] = df[col].str.strip()

# 2.5 nulos: motivo_desligamento e tipo_afastamento sao nulos "estruturais"
#     (nao se aplicam a quem esta ativo / nao tem afastamento) -> mantidos como
#     nulo e tratados no front como "-" / "N/A", nao sao erro de coleta.
#     Nomes duplicados (15 casos) foram checados: cada par tem id, idade,
#     cidade e data de admissao diferentes -> coincidencia de nome, nao duplicata.

# 2.6 outliers: describe() nao mostrou valores fora de faixa plausivel
#     (idade 18-61, salario coerente por cargo, banco_horas negativo é
#     esperado - representa saldo devedor de horas). Nenhum corte aplicado.

# ---------------------------------------------------------------------------
# 3. COLUNAS DERIVADAS (regras de negocio)
# ---------------------------------------------------------------------------


def faixa_etaria(idade):
    if idade < 25:
        return "18-24"
    if idade < 35:
        return "25-34"
    if idade < 45:
        return "35-44"
    if idade < 55:
        return "45-54"
    return "55+"


def faixa_salarial(sal):
    if sal < 3000:
        return "Ate R$3.000"
    if sal < 6000:
        return "R$3.000-6.000"
    if sal < 10000:
        return "R$6.000-10.000"
    if sal < 15000:
        return "R$10.000-15.000"
    return "Acima de R$15.000"


NIVEL_CARGO = {
    "Auxiliar Operacional": "Operacional",
    "Conferente": "Operacional",
    "Motorista": "Operacional",
    "Assistente": "Tatico",
    "Analista": "Tatico",
    "Analista Senior": "Tatico",
    "Supervisor": "Tatico",
    "Coordenador": "Estrategico",
    "Gerente": "Estrategico",
}

df["cargo"] = df["cargo"].str.replace("Sênior", "Senior", regex=False)
df["faixa_etaria"] = df["idade"].apply(faixa_etaria)
df["faixa_salarial"] = df["salario"].apply(faixa_salarial)
df["nivel_cargo"] = df["cargo"].map(NIVEL_CARGO)

# ---------------------------------------------------------------------------
# 4. DIMENSOES
# ---------------------------------------------------------------------------

dim_departamento = (
    df[["departamento"]]
    .drop_duplicates()
    .sort_values("departamento")
    .reset_index(drop=True)
)
dim_departamento.insert(0, "id_departamento", range(1, len(dim_departamento) + 1))

dim_cargo = (
    df[["cargo", "nivel_cargo"]]
    .drop_duplicates()
    .sort_values("cargo")
    .reset_index(drop=True)
)
dim_cargo.insert(0, "id_cargo", range(1, len(dim_cargo) + 1))

dim_colaborador = df[
    [
        "id_colaborador",
        "nome",
        "sexo",
        "idade",
        "faixa_etaria",
        "estado_civil",
        "escolaridade",
        "cidade",
        "estado",
        "regional",
        "centro_distribuicao",
        "pcd",
        "data_admissao",
        "tempo_empresa",
        "gestor",
        "tipo_contrato",
        "modelo_trabalho",
        "status",
    ]
].copy()
dim_colaborador["data_admissao"] = dim_colaborador["data_admissao"].dt.strftime("%Y-%m-%d")

# ---------------------------------------------------------------------------
# 5. FATO (grao = 1 linha por colaborador, snapshot atual)
# ---------------------------------------------------------------------------

fato = df.merge(dim_departamento, on="departamento").merge(dim_cargo, on=["cargo", "nivel_cargo"])

fato_rh = fato[
    [
        "id_colaborador",
        "id_departamento",
        "id_cargo",
        "salario",
        "faixa_salarial",
        "turnover",
        "motivo_desligamento",
        "faltas",
        "absenteismo",
        "dias_afastamento",
        "tipo_afastamento",
        "horas_extras",
        "banco_horas",
        "sla_recrutamento",
        "nota_desempenho",
        "engajamento",
        "horas_treinamento",
        "promovido",
        "ferias_pendentes",
    ]
].rename(columns={"absenteismo": "absenteismo_pct"})

# ---------------------------------------------------------------------------
# 6. FATO MENSAL (serie real, agregada a partir do painel colaborador x mes)
#    A base de origem eh um snapshot unico (sem historico real por mes), mas
#    "serie_mensal_raw.csv" (gerada por generate_serie_mensal_raw.py) monta
#    um historico mes a mes por colaborador ancorado nos valores reais do
#    snapshot. Aqui so agregamos esse historico (headcount = colaboradores
#    presentes no mes, turnover% = desligamentos no mes / headcount,
#    absenteismo% = media do mes) -- nao ha mais tendencia/ruido sintetico
#    aplicado no nivel agregado.
# ---------------------------------------------------------------------------

serie_raw = pd.read_csv(RAW_SERIE_MENSAL_PATH, encoding="utf-8")

fato_rh_mensal = (
    serie_raw.groupby("mes")
    .agg(
        headcount=("id_colaborador", "count"),
        desligamentos=("turnover", lambda s: (s == "Sim").sum()),
        absenteismo_pct=("absenteismo", "mean"),
    )
    .reset_index()
)
fato_rh_mensal["turnover_pct"] = (
    fato_rh_mensal["desligamentos"] / fato_rh_mensal["headcount"] * 100
).round(2)
fato_rh_mensal["absenteismo_pct"] = fato_rh_mensal["absenteismo_pct"].round(2)
fato_rh_mensal = fato_rh_mensal[["mes", "headcount", "turnover_pct", "absenteismo_pct"]]

# ---------------------------------------------------------------------------
# 7. EXPORTACAO
# ---------------------------------------------------------------------------

dim_colaborador.to_csv(f"{OUT_DIR}/dim_colaborador.csv", index=False, encoding="utf-8")
dim_departamento.to_csv(f"{OUT_DIR}/dim_departamento.csv", index=False, encoding="utf-8")
dim_cargo.to_csv(f"{OUT_DIR}/dim_cargo.csv", index=False, encoding="utf-8")
fato_rh.to_csv(f"{OUT_DIR}/fato_rh.csv", index=False, encoding="utf-8")
fato_rh_mensal.to_csv(f"{OUT_DIR}/fato_rh_mensal.csv", index=False, encoding="utf-8")

print("OK - arquivos gerados em", OUT_DIR)
print("dim_colaborador:", dim_colaborador.shape)
print("dim_departamento:", dim_departamento.shape)
print("dim_cargo:", dim_cargo.shape)
print("fato_rh:", fato_rh.shape)
print("fato_rh_mensal:", fato_rh_mensal.shape)
