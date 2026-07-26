"""
Gera a serie temporal (24 meses) por colaborador a partir do snapshot raw.

A base raw original ("People Analytics - J&T Express.csv") e um snapshot
unico (1 linha por colaborador, sem historico). Este script cria um novo
arquivo raw, em formato de painel (1 linha por colaborador por mes), para
que o restante do pipeline (build_star_schema.py) deixe de depender da
simulacao agregada por tendencia/ruido e passe a agregar a serie mensal
a partir de historico real por colaborador.

Regras:
- Janela: 24 meses encerrando no mes corrente (HOJE).
- Colaborador so aparece nos meses em que estava empregado: do mes de
  admissao (ou inicio da janela, o que for depois) ate o ultimo mes
  trabalhado (mes atual, se Ativo; ou um mes de desligamento sorteado
  dentro da janela, se Inativo).
- Metricas mensais variaveis (faltas, absenteismo, horas_extras,
  nota_desempenho, engajamento) sao geradas por um passeio aleatorio por
  colaborador, ancorado no valor real do snapshot no ultimo mes (assim o
  ultimo mes de cada colaborador ativo bate exatamente com o snapshot).
- salario e mantido constante (nao ha indicio de reajustes na base).
- Cada colaborador tem sua propria seed (SEED + id_colaborador), garantindo
  reprodutibilidade.

Uso: python generate_serie_mensal_raw.py
Entrada:  ../data/raw/People Analytics - J&T Express.csv
Saida:    ../data/raw/People Analytics - J&T Express - serie_mensal.csv
"""
import numpy as np
import pandas as pd

RAW_PATH = "../data/raw/People Analytics - J&T Express.csv"
OUT_PATH = "../data/raw/People Analytics - J&T Express - serie_mensal.csv"
SEED = 42
N_MESES = 24
HOJE = pd.Timestamp("2026-07-26")

df = pd.read_csv(RAW_PATH, encoding="utf-8")
df = df.drop_duplicates().drop_duplicates(subset=["id_colaborador"], keep="first")

for col in ["absenteismo", "nota_desempenho"]:
    df[col] = df[col].astype(str).str.replace(",", ".", regex=False).astype(float)
df["data_admissao"] = pd.to_datetime(df["data_admissao"])

mes_atual = HOJE.to_period("M").to_timestamp()
meses = pd.date_range(end=mes_atual, periods=N_MESES, freq="MS")
janela_inicio, janela_fim = meses[0], meses[-1]


def passeio_ancorado(rng, n, anchor, step_std, low, high, as_int=False):
    """Serie de tamanho n terminando exatamente em `anchor`, com ruido
    gaussiano acumulado para tras (passeio aleatorio), recortada em [low, high]."""
    vals = np.empty(n)
    vals[-1] = anchor
    for k in range(n - 2, -1, -1):
        vals[k] = vals[k + 1] + rng.normal(0, step_std)
    vals = np.clip(vals, low, high)
    if as_int:
        vals = np.round(vals)
    return vals


rows = []
for r in df.itertuples(index=False):
    rng = np.random.default_rng(SEED + int(r.id_colaborador))

    admissao_mes = pd.Timestamp(r.data_admissao).to_period("M").to_timestamp()
    primeiro_mes = max(admissao_mes, janela_inicio)

    if r.status == "Inativo":
        candidatos = pd.date_range(primeiro_mes, janela_fim, freq="MS")
        if len(candidatos) == 0:
            continue
        ultimo_mes = candidatos[rng.integers(0, len(candidatos))]
    else:
        ultimo_mes = janela_fim

    if primeiro_mes > ultimo_mes:
        continue

    meses_emprego = pd.date_range(primeiro_mes, ultimo_mes, freq="MS")
    n = len(meses_emprego)

    faltas_serie = passeio_ancorado(rng, n, r.faltas, 0.8, 0, 15, as_int=True)
    absenteismo_serie = passeio_ancorado(rng, n, r.absenteismo, 0.35, 0, 12)
    horas_extras_serie = passeio_ancorado(rng, n, r.horas_extras, 6, 0, 90, as_int=True)
    nota_serie = passeio_ancorado(rng, n, r.nota_desempenho, 0.25, 0, 5)
    engajamento_serie = passeio_ancorado(rng, n, r.engajamento, 5, 0, 100, as_int=True)

    for i, mes in enumerate(meses_emprego):
        saida = r.status == "Inativo" and mes == ultimo_mes
        rows.append(
            {
                "id_colaborador": r.id_colaborador,
                "mes": mes.strftime("%Y-%m"),
                "status": "Inativo" if saida else "Ativo",
                "turnover": "Sim" if saida else "Não",
                "salario": r.salario,
                "faltas": int(faltas_serie[i]),
                "absenteismo": round(float(absenteismo_serie[i]), 2),
                "horas_extras": int(horas_extras_serie[i]),
                "nota_desempenho": round(float(nota_serie[i]), 1),
                "engajamento": int(engajamento_serie[i]),
            }
        )

serie_mensal = pd.DataFrame(rows).sort_values(["id_colaborador", "mes"]).reset_index(drop=True)
serie_mensal.to_csv(OUT_PATH, index=False, encoding="utf-8")

print("OK -", len(serie_mensal), "linhas (colaborador x mes) geradas em", OUT_PATH)
print("Janela:", janela_inicio.strftime("%Y-%m"), "a", janela_fim.strftime("%Y-%m"))
print("Colaboradores com pelo menos 1 mes na janela:", serie_mensal["id_colaborador"].nunique(), "de", len(df))
