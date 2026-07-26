import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple, ScatterSimple } from "../components/charts";
import { groupAvg, groupPercent, avg, sortDesc, count, fmtPct } from "../utils/aggregate";

const CARGOS_GESTAO = ["Supervisor", "Coordenador", "Gerente"];

// O campo "gestor" da base é um nome distinto por colaborador (985 nomes
// únicos em 1000 linhas, nenhum com 3+ liderados) - não representa uma
// hierarquia real. O ranking usa, em vez disso, os próprios colaboradores
// que ocupam cargo de gestão, ordenados pela nota de desempenho individual.
function rankGestores(rows) {
  return rows
    .filter((r) => CARGOS_GESTAO.includes(r.cargo) && r.nota_desempenho != null)
    .map((r) => ({
      nome: r.nome,
      cargo: r.cargo,
      departamento: r.departamento,
      nota: r.nota_desempenho,
    }))
    .sort((a, b) => b.nota - a.nota)
    .slice(0, 10);
}

export default function Performance() {
  const { filtered } = useFilters();

  const notaMedia = avg(filtered, "nota_desempenho");
  const pctPromovidos = Math.round((count(filtered, (r) => r.promovido === "Sim") / (filtered.length || 1)) * 1000) / 10;
  const horasTreinoMedia = avg(filtered, "horas_treinamento");
  const pctTreinados = Math.round((count(filtered, (r) => r.horas_treinamento > 0) / (filtered.length || 1)) * 1000) / 10;

  const notaPorArea = sortDesc(groupAvg(filtered, "departamento", "nota_desempenho"));
  const promocoesPorArea = sortDesc(groupPercent(filtered, "departamento", (r) => r.promovido === "Sim"));
  const treinadosPorArea = sortDesc(groupPercent(filtered, "departamento", (r) => r.horas_treinamento > 0));
  const horasTreinoPorArea = sortDesc(groupAvg(filtered, "departamento", "horas_treinamento"));
  const correlacao = filtered.map((r) => ({ horas_extras: r.horas_extras, nota_desempenho: r.nota_desempenho }));
  const gestores = rankGestores(filtered);

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label="Nota Média de Desempenho" value={notaMedia.toFixed(2)} sub="Escala de avaliação (0-5)" />
        <KpiCard label="Promoções" value={fmtPct(pctPromovidos)} sub="% de colaboradores promovidos" />
        <KpiCard label="Treinamentos" value={fmtPct(pctTreinados)} sub="% de colaboradores com treinamento" />
        <KpiCard label="Horas de Treinamento" value={horasTreinoMedia.toFixed(1) + "h"} sub="Média por colaborador" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Nota Média por Área" sub="Avaliação de desempenho (0-5)">
          <BarSimple data={notaPorArea} horizontal formatter={(v) => v} />
        </ChartCard>

        <ChartCard title="Promoções por Área" sub="% de colaboradores promovidos">
          <BarSimple data={promocoesPorArea} horizontal color="#1a1a1a" formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Treinamentos por Área" sub="% de colaboradores com ao menos 1h de treinamento">
          <BarSimple data={treinadosPorArea} horizontal formatter={(v) => fmtPct(v)} />
        </ChartCard>

        <ChartCard title="Horas de Treinamento por Área" sub="Média por colaborador">
          <BarSimple data={horasTreinoPorArea} horizontal color="#1a1a1a" formatter={(v) => v + "h"} />
        </ChartCard>

        <ChartCard title="Correlação: Desempenho x Horas Extras" sub="Cada ponto representa um colaborador" span2>
          <ScatterSimple data={correlacao} xKey="horas_extras" yKey="nota_desempenho" xLabel="Horas Extras" yLabel="Nota" />
        </ChartCard>

        <ChartCard
          title="Ranking de Gestores"
          sub="Top 10 colaboradores em cargo de gestão (Supervisor/Coordenador/Gerente), por nota individual"
          span2
        >
          <table className="rank-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {gestores.map((g, i) => (
                <tr key={g.nome + i}>
                  <td><span className="rank-badge">{i + 1}</span></td>
                  <td>{g.nome}</td>
                  <td>{g.cargo}</td>
                  <td>{g.departamento}</td>
                  <td><span className="pill">{g.nota.toFixed(2)}</span></td>
                </tr>
              ))}
              {!gestores.length && (
                <tr><td colSpan={5} style={{ color: "#9199a3" }}>Sem colaboradores em cargo de gestão no filtro atual.</td></tr>
              )}
            </tbody>
          </table>
        </ChartCard>
      </div>
    </>
  );
}
