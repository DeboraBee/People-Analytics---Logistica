import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple, PieSimple } from "../components/charts";
import { groupCount, groupAvg, avg, count, sortDesc, fmtInt, fmtH, fmtPct } from "../utils/aggregate";

export default function SaudeOrganizacional() {
  const { filtered } = useFilters();

  const afastados = count(filtered, (r) => (r.dias_afastamento || 0) > 0);
  const feriasPendentesMedia = avg(filtered, "ferias_pendentes");
  const engajamentoMedio = avg(filtered, "engajamento");
  const bancoHorasMedio = avg(filtered, "banco_horas");

  const afastamentosMotivo = sortDesc(
    groupCount(
      filtered.filter((r) => r.tipo_afastamento),
      "tipo_afastamento"
    )
  );
  const bancoHorasDept = groupAvg(filtered, "departamento", "banco_horas").sort((a, b) => a.value - b.value);
  const horasExtrasDept = sortDesc(groupAvg(filtered, "departamento", "horas_extras"));
  const feriasDept = sortDesc(groupAvg(filtered, "departamento", "ferias_pendentes"));
  const absenteismoDept = sortDesc(groupAvg(filtered, "departamento", "absenteismo_pct"));
  const engajamentoDept = sortDesc(groupAvg(filtered, "departamento", "engajamento"));

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label="Colaboradores Afastados" value={fmtInt(afastados)} sub="Com dias de afastamento registrados" />
        <KpiCard label="Férias Pendentes" value={fmtInt(feriasPendentesMedia) + " dias"} sub="Média por colaborador" />
        <KpiCard label="Engajamento" value={fmtInt(engajamentoMedio) + "%"} sub="Score médio da pesquisa interna" />
        <KpiCard label="Banco de Horas" value={fmtH(bancoHorasMedio)} sub="Saldo médio (positivo ou devedor)" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Afastamentos por Motivo" sub="Colaboradores com afastamento registrado">
          <PieSimple data={afastamentosMotivo} formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Ranking de Absenteísmo" sub="Média de % de faltas por departamento">
          <BarSimple data={absenteismoDept} horizontal color="#1a1a1a" formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Banco de Horas por Departamento" sub="Saldo médio (horas negativas = devedor)">
          <BarSimple data={bancoHorasDept} horizontal formatter={(v) => v + "h"} />
        </ChartCard>

        <ChartCard title="Horas Extras por Equipe" sub="Média por colaborador">
          <BarSimple data={horasExtrasDept} horizontal color="#1a1a1a" formatter={(v) => v + "h"} />
        </ChartCard>

        <ChartCard title="Férias Pendentes por Departamento" sub="Média de dias por colaborador">
          <BarSimple data={feriasDept} horizontal formatter={(v) => v + " dias"} />
        </ChartCard>

        <ChartCard title="Engajamento por Departamento" sub="Score médio da pesquisa interna (0-100)">
          <BarSimple data={engajamentoDept} horizontal color="#1a1a1a" formatter={(v) => v} />
        </ChartCard>
      </div>
    </>
  );
}
