import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple } from "../components/charts";
import { groupCount, groupAvg, groupPercent, sortDesc, fmtInt, fmtPct, fmtH } from "../utils/aggregate";

export default function Unidades() {
  const { filtered } = useFilters();

  const ativos = filtered.filter((r) => r.status === "Ativo");

  const centrosDistribuicao = new Set(filtered.map((r) => r.centro_distribuicao).filter(Boolean)).size;

  const headcountCd = sortDesc(groupCount(ativos, "centro_distribuicao"));
  const turnoverCd = sortDesc(groupPercent(filtered, "centro_distribuicao", (r) => r.turnover === "Sim"));
  const absenteismoCd = sortDesc(groupAvg(ativos, "centro_distribuicao", "absenteismo_pct"));
  const horasExtrasCd = sortDesc(groupAvg(ativos, "centro_distribuicao", "horas_extras"));
  const engajamentoCd = groupAvg(ativos, "centro_distribuicao", "engajamento");

  // normaliza cada variavel para 0-1 dentro do recorte filtrado (min-max),
  // invertendo o engajamento (quanto menor, pior) antes de combinar
  function normalizar(valores, inverter = false) {
    const nums = valores.map((v) => v.value);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const map = new Map();
    for (const { name, value } of valores) {
      const n = max === min ? 0 : (value - min) / (max - min);
      map.set(name, inverter ? 1 - n : n);
    }
    return map;
  }

  const normTurnover = normalizar(turnoverCd);
  const normAbsenteismo = normalizar(absenteismoCd);
  const normHorasExtras = normalizar(horasExtrasCd);
  const normEngajamento = normalizar(engajamentoCd, true);

  const ranking = headcountCd
    .map(({ name, value: headcount }) => {
      const turnover = turnoverCd.find((r) => r.name === name)?.value ?? 0;
      const absenteismo = absenteismoCd.find((r) => r.name === name)?.value ?? 0;
      const horasExtras = horasExtrasCd.find((r) => r.name === name)?.value ?? 0;
      const engajamento = engajamentoCd.find((r) => r.name === name)?.value ?? 0;
      const media =
        ((normTurnover.get(name) ?? 0) +
          (normAbsenteismo.get(name) ?? 0) +
          (normHorasExtras.get(name) ?? 0) +
          (normEngajamento.get(name) ?? 0)) /
        4;
      return { name, headcount, turnover, absenteismo, horasExtras, engajamento, risco: Math.round(media * 100) };
    })
    .sort((a, b) => b.risco - a.risco)
    .slice(0, 10);

  function pillRiscoClass(score) {
    if (score >= 65) return "pill pill-risk-high";
    if (score >= 35) return "pill pill-risk-mid";
    return "pill pill-risk-low";
  }

  const maiorTurnover = turnoverCd[0];
  const maiorAbsenteismo = absenteismoCd[0];
  const unidadePrioritaria = ranking[0];

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label="Centros de Distribuição" value={fmtInt(centrosDistribuicao)} sub="Unidades no filtro atual" />
        <KpiCard
          label="Unidade Prioritária"
          value={unidadePrioritaria?.name ?? "-"}
          sub={unidadePrioritaria ? `Score de risco ${unidadePrioritaria.risco}/100` : "-"}
        />
        <KpiCard label="Maior Turnover" value={maiorTurnover?.name ?? "-"} sub={maiorTurnover ? fmtPct(maiorTurnover.value) : "-"} />
        <KpiCard label="Maior Absenteísmo" value={maiorAbsenteismo?.name ?? "-"} sub={maiorAbsenteismo ? fmtPct(maiorAbsenteismo.value) : "-"} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Headcount por Centro de Distribuição" sub="Colaboradores ativos">
          <BarSimple data={headcountCd} horizontal formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Turnover por Centro de Distribuição" sub="% de desligados sobre o total da unidade">
          <BarSimple data={turnoverCd} horizontal color="#1a1a1a" formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Absenteísmo por Centro de Distribuição" sub="Média entre ativos">
          <BarSimple data={absenteismoCd} horizontal formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Horas Extras por Centro de Distribuição" sub="Média mensal entre ativos">
          <BarSimple data={horasExtrasCd} horizontal color="#1a1a1a" formatter={(v) => fmtH(v)} />
        </ChartCard>

        <div className="section-title" style={{ gridColumn: "1 / -1" }}>Priorização — Onde Agir Primeiro</div>

        <ChartCard
          title="Ranking de Risco por Unidade"
          sub="Score combina turnover, absenteísmo, horas extras (quanto maior, pior) e engajamento (quanto menor, pior), normalizados dentro do recorte filtrado"
          span2
        >
          <table className="rank-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Centro de Distribuição</th>
                <th>Headcount</th>
                <th>Turnover</th>
                <th>Absenteísmo</th>
                <th>Horas Extras</th>
                <th>Engajamento</th>
                <th>Score de Risco</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.name + i}>
                  <td><span className="rank-badge">{i + 1}</span></td>
                  <td>{r.name}</td>
                  <td>{fmtInt(r.headcount)}</td>
                  <td>{fmtPct(r.turnover)}</td>
                  <td>{fmtPct(r.absenteismo)}</td>
                  <td>{fmtH(r.horasExtras)}</td>
                  <td>{fmtPct(r.engajamento)}</td>
                  <td><span className={pillRiscoClass(r.risco)}>{r.risco}/100</span></td>
                </tr>
              ))}
              {!ranking.length && (
                <tr><td colSpan={8} style={{ color: "#9199a3" }}>Sem unidades no filtro atual.</td></tr>
              )}
            </tbody>
          </table>
        </ChartCard>
      </div>
    </>
  );
}
