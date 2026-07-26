import { useMemo } from "react";
import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple, LineSimple } from "../components/charts";
import { groupCount, groupPercent, avg, count, sortDesc, fmtInt, fmtMoney, fmtPct, fmtH, round, buildSerieMensal } from "../utils/aggregate";

export default function VisaoGeral() {
  const { filtered, filteredMensal } = useFilters();
  const serieMensal = useMemo(() => buildSerieMensal(filteredMensal), [filteredMensal]);

  const ativos = filtered.filter((r) => r.status === "Ativo");
  const inativos = filtered.length - ativos.length;
  const headcount = ativos.length;
  const tempoEmpresaMedio = avg(ativos, "tempo_empresa");
  const turnoverPct = round((count(filtered, (r) => r.turnover === "Sim") / (filtered.length || 1)) * 100, 1);
  const absenteismo = avg(ativos, "absenteismo_pct");
  const slaMedio = avg(filtered.filter((r) => r.sla_recrutamento > 0), "sla_recrutamento");
  const horasExtras = avg(ativos, "horas_extras");
  const bancoHoras = avg(ativos, "banco_horas");
  const afastados = count(ativos, (r) => (r.dias_afastamento || 0) > 0);
  const salarioMedio = avg(ativos, "salario");

  const headcountDept = sortDesc(groupCount(ativos, "departamento"));
  const turnoverDept = sortDesc(groupPercent(filtered, "departamento", (r) => r.turnover === "Sim"));

  return (
    <>
      <div className="kpi-grid fifths">
        <KpiCard label="Headcount" value={fmtInt(headcount)} sub="Colaboradores ativos" />
        <KpiCard label="Ativos x Inativos" value={`${fmtInt(headcount)} / ${fmtInt(inativos)}`} sub="Colaboradores ativos / inativos no quadro" />
        <KpiCard label="Turnover" value={fmtPct(turnoverPct)} sub="Desligamentos / total no período" />
        <KpiCard label="Absenteísmo" value={fmtPct(absenteismo)} sub="Média entre ativos" />
        <KpiCard label="Tempo Médio de Empresa" value={tempoEmpresaMedio.toFixed(1) + " anos"} sub="Entre colaboradores ativos" />
      </div>

      <div className="kpi-grid fifths">
        <KpiCard label="SLA Médio" value={fmtInt(slaMedio) + " dias"} sub="Recrutamento e seleção" />
        <KpiCard label="Horas Extras" value={fmtH(horasExtras)} sub="Média mensal por colaborador" />
        <KpiCard label="Banco de Horas" value={fmtH(bancoHoras)} sub="Saldo médio (pode ser negativo)" />
        <KpiCard label="Afastados" value={fmtInt(afastados)} sub="Colaboradores com dias de afastamento" />
        <KpiCard label="Média Salarial" value={fmtMoney(salarioMedio)} sub="Entre colaboradores ativos" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Headcount por Departamento" sub="Colaboradores ativos">
          <BarSimple data={headcountDept} horizontal formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Turnover por Área" sub="% de desligados sobre o total do departamento">
          <BarSimple data={turnoverDept} horizontal color="#1a1a1a" formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Evolução Mensal do Turnover" sub="Taxa acumulada em janela móvel de 12 meses">
          <LineSimple data={serieMensal} xKey="mes" dataKey="turnover_pct" formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Evolução do Absenteísmo" sub="Média mensal entre colaboradores no período">
          <LineSimple data={serieMensal} xKey="mes" dataKey="absenteismo_pct" color="#1a1a1a" formatter={(v) => fmtPct(v)} />
        </ChartCard>
      </div>
    </>
  );
}
