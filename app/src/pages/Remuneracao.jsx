import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple } from "../components/charts";
import { groupAvg, groupSum, sortDesc, avg, sum, fmtInt, fmtMoney } from "../utils/aggregate";

export default function Remuneracao() {
  const { filtered } = useFilters();

  const ativos = filtered.filter((r) => r.status === "Ativo");
  const recrutados = filtered.filter((r) => r.sla_recrutamento > 0);

  const salarioMedio = avg(ativos, "salario");
  const custoTotalFolha = sum(ativos, "salario");
  const slaMedio = avg(recrutados, "sla_recrutamento");

  const custoPorDepartamento = sortDesc(groupSum(ativos, "departamento", "salario"));
  const areaMaiorCusto = custoPorDepartamento[0];

  const salarioPorCargo = sortDesc(groupAvg(ativos, "cargo", "salario"));
  const salarioPorDepartamento = sortDesc(groupAvg(ativos, "departamento", "salario"));
  const slaPorDepartamento = sortDesc(groupAvg(recrutados, "departamento", "sla_recrutamento"));

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label="Média Salarial" value={fmtMoney(salarioMedio)} sub="Entre colaboradores ativos" />
        <KpiCard label="Custo Total da Folha" value={fmtMoney(custoTotalFolha)} sub="Soma dos salários dos ativos" />
        <KpiCard label="Área de Maior Custo" value={areaMaiorCusto?.name ?? "-"} sub={areaMaiorCusto ? fmtMoney(areaMaiorCusto.value) : "-"} />
        <KpiCard label="SLA Médio de Recrutamento" value={fmtInt(slaMedio) + " dias"} sub="Tempo médio até a contratação" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Salário Médio por Cargo" sub="Entre colaboradores ativos">
          <BarSimple data={salarioPorCargo} horizontal formatter={(v) => fmtMoney(v)} />
        </ChartCard>

        <ChartCard title="Salário Médio por Departamento" sub="Entre colaboradores ativos">
          <BarSimple data={salarioPorDepartamento} horizontal color="#1a1a1a" formatter={(v) => fmtMoney(v)} />
        </ChartCard>

        <ChartCard title="Custo Total por Departamento" sub="Soma dos salários dos ativos">
          <BarSimple data={custoPorDepartamento} horizontal formatter={(v) => fmtMoney(v)} />
        </ChartCard>

        <ChartCard title="SLA Médio de Recrutamento por Área" sub="Dias até a contratação, por departamento">
          <BarSimple data={slaPorDepartamento} horizontal color="#1a1a1a" formatter={(v) => fmtInt(v) + " dias"} />
        </ChartCard>
      </div>
    </>
  );
}
