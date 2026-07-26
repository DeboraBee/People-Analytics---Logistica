export function groupCount(rows, key) {
  const map = new Map();
  for (const r of rows) {
    const k = r[key] ?? "N/A";
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

export function groupAvg(rows, key, valueKey) {
  const sums = new Map();
  const counts = new Map();
  for (const r of rows) {
    const k = r[key] ?? "N/A";
    const v = r[valueKey];
    if (v === null || v === undefined) continue;
    sums.set(k, (sums.get(k) || 0) + v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...sums.entries()].map(([name, sum]) => ({
    name,
    value: round(sum / counts.get(name), 2),
  }));
}

export function groupSum(rows, key, valueKey) {
  const sums = new Map();
  for (const r of rows) {
    const k = r[key] ?? "N/A";
    const v = r[valueKey];
    if (v === null || v === undefined) continue;
    sums.set(k, (sums.get(k) || 0) + v);
  }
  return [...sums.entries()].map(([name, value]) => ({ name, value: round(value, 2) }));
}

export function groupPercent(rows, key, predicate) {
  const totals = new Map();
  const matches = new Map();
  for (const r of rows) {
    const k = r[key] ?? "N/A";
    totals.set(k, (totals.get(k) || 0) + 1);
    if (predicate(r)) matches.set(k, (matches.get(k) || 0) + 1);
  }
  return [...totals.entries()].map(([name, total]) => ({
    name,
    value: round(((matches.get(name) || 0) / total) * 100, 1),
  }));
}

export function avg(rows, key) {
  const vals = rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
  if (!vals.length) return 0;
  return round(vals.reduce((a, b) => a + b, 0) / vals.length, 2);
}

export function sum(rows, key) {
  return rows.reduce((a, r) => a + (r[key] ?? 0), 0);
}

export function count(rows, predicate) {
  return predicate ? rows.filter(predicate).length : rows.length;
}

export function round(v, d = 1) {
  const m = 10 ** d;
  return Math.round(v * m) / m;
}

export function sortDesc(arr) {
  return [...arr].sort((a, b) => b.value - a.value);
}

export function fmtInt(v) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(v));
}

export function fmtMoney(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

export function fmtPct(v) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)}%`;
}

// Reconstroi a serie mensal (headcount, turnover % em janela movel de 12
// meses, absenteismo % medio) a partir do painel colaborador x mes ja
// filtrado. Espelha a mesma logica usada no ETL (build_star_schema.py),
// mas em cima do recorte atual em vez do total da empresa.
export function buildSerieMensal(rows) {
  const porMes = new Map();
  for (const r of rows) {
    const m = porMes.get(r.mes) || { headcount: 0, desligamentos: 0, absSum: 0, absCount: 0 };
    m.headcount += 1;
    if (r.turnover === "Sim") m.desligamentos += 1;
    if (r.absenteismo_pct !== null && r.absenteismo_pct !== undefined) {
      m.absSum += r.absenteismo_pct;
      m.absCount += 1;
    }
    porMes.set(r.mes, m);
  }

  const serie = [...porMes.keys()]
    .sort()
    .map((mes) => {
      const m = porMes.get(mes);
      return {
        mes,
        headcount: m.headcount,
        desligamentos: m.desligamentos,
        absenteismo_pct: m.absCount ? round(m.absSum / m.absCount, 2) : 0,
      };
    });

  return serie.map((_, i) => {
    const janela = serie.slice(Math.max(0, i - 11), i + 1);
    const somaDesligamentos = janela.reduce((a, s) => a + s.desligamentos, 0);
    const headcountMedio = janela.reduce((a, s) => a + s.headcount, 0) / janela.length;
    const turnover_pct = headcountMedio ? round((somaDesligamentos / headcountMedio) * 100, 2) : 0;
    return { mes: serie[i].mes, headcount: serie[i].headcount, turnover_pct, absenteismo_pct: serie[i].absenteismo_pct };
  });
}

export function fmtH(v) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)}h`;
}
