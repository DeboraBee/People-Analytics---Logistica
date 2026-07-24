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

export function fmtH(v) {
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)}h`;
}
