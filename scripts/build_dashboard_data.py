"""
Gera o JSON consumido pelo dashboard a partir do modelo estrela (dim/fato).
Junta fato_rh + dimensoes em uma tabela unica desnormalizada (grao = 1 colaborador),
que fica facil de filtrar no cliente. Tambem exporta a serie mensal simulada.

Uso: python build_dashboard_data.py
Entrada:  ../data/processed/*.csv
Saida:    ../app/src/data/colaboradores.json
          ../app/src/data/serie_mensal.json
"""
import json

import pandas as pd

IN_DIR = "../data/processed"
OUT_DIR = "../app/src/data"

dim_colaborador = pd.read_csv(f"{IN_DIR}/dim_colaborador.csv")
dim_departamento = pd.read_csv(f"{IN_DIR}/dim_departamento.csv")
dim_cargo = pd.read_csv(f"{IN_DIR}/dim_cargo.csv")
fato_rh = pd.read_csv(f"{IN_DIR}/fato_rh.csv")
fato_rh_mensal = pd.read_csv(f"{IN_DIR}/fato_rh_mensal.csv")

full = (
    fato_rh.merge(dim_colaborador, on="id_colaborador")
    .merge(dim_departamento, on="id_departamento")
    .merge(dim_cargo, on="id_cargo")
)

full = full.astype(object).where(pd.notna(full), None)

records = full.to_dict(orient="records")

with open(f"{OUT_DIR}/colaboradores.json", "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False)

with open(f"{OUT_DIR}/serie_mensal.json", "w", encoding="utf-8") as f:
    json.dump(fato_rh_mensal.to_dict(orient="records"), f, ensure_ascii=False)

print("OK -", len(records), "colaboradores exportados")
