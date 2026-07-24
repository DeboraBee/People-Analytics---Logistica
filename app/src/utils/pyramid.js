const FAIXAS = ["18-24", "25-34", "35-44", "45-54", "55+"];

export function buildPyramid(rows) {
  return FAIXAS.map((faixa) => {
    const subset = rows.filter((r) => r.faixa_etaria === faixa);
    const masc = subset.filter((r) => r.sexo === "Masculino").length;
    const fem = subset.filter((r) => r.sexo === "Feminino").length;
    return { name: faixa, Masculino: -masc, Feminino: fem };
  });
}

const FAIXA_SAL_ORDER = [
  "Ate R$3.000",
  "R$3.000-6.000",
  "R$6.000-10.000",
  "R$10.000-15.000",
  "Acima de R$15.000",
];

export function orderFaixaSalarial(grouped) {
  const map = new Map(grouped.map((g) => [g.name, g.value]));
  return FAIXA_SAL_ORDER.filter((f) => map.has(f)).map((f) => ({ name: f, value: map.get(f) }));
}

const TEMPO_BUCKETS = [
  { label: "< 1 ano", test: (t) => t < 1 },
  { label: "1-3 anos", test: (t) => t >= 1 && t < 3 },
  { label: "3-5 anos", test: (t) => t >= 3 && t < 5 },
  { label: "5-10 anos", test: (t) => t >= 5 && t < 10 },
  { label: "10+ anos", test: (t) => t >= 10 },
];

export function bucketTempoEmpresa(rows) {
  return TEMPO_BUCKETS.map(({ label, test }) => ({
    name: label,
    value: rows.filter((r) => test(r.tempo_empresa)).length,
  }));
}
