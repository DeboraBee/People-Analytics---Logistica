import { useFilters } from "../context/FilterContext";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { BarSimple, PieSimple } from "../components/charts";
import PyramidChart from "../components/PyramidChart";
import { groupCount, sortDesc, count, fmtInt, fmtPct, round } from "../utils/aggregate";
import { buildPyramid, orderFaixaSalarial, bucketTempoEmpresa } from "../utils/pyramid";

const CARGOS_LIDERANCA = ["Tatico", "Estrategico"];
const LIMITE_FERIAS_VENCIDAS = 20;

export default function Pessoas() {
  const { filtered } = useFilters();

  const ativos = filtered.filter((r) => r.status === "Ativo");

  const pctPcd = round((count(ativos, (r) => r.pcd === "Sim") / (ativos.length || 1)) * 100, 1);
  const lideranca = ativos.filter((r) => CARGOS_LIDERANCA.includes(r.nivel_cargo));
  const pctMulheresLideranca = round((count(lideranca, (r) => r.sexo === "Feminino") / (lideranca.length || 1)) * 100, 1);
  const feriasVencidas = count(ativos, (r) => (r.ferias_pendentes || 0) > LIMITE_FERIAS_VENCIDAS);
  const pctTemporario = round((count(ativos, (r) => r.tipo_contrato === "Temporário") / (ativos.length || 1)) * 100, 1);

  const piramide = buildPyramid(filtered);
  const escolaridade = sortDesc(groupCount(filtered, "escolaridade"));
  const sexo = groupCount(filtered, "sexo");
  const pcd = groupCount(filtered, "pcd");
  const tempoEmpresa = bucketTempoEmpresa(filtered);
  const faixaSalarial = orderFaixaSalarial(groupCount(filtered, "faixa_salarial"));

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label="Representatividade PCD" value={fmtPct(pctPcd)} sub="Cota legal mínima: 4-5% (empresas com 500+ colaboradores)" />
        <KpiCard label="Mulheres em Liderança" value={fmtPct(pctMulheresLideranca)} sub="Cargos táticos e estratégicos" />
        <KpiCard label="Férias Vencidas" value={fmtInt(feriasVencidas)} sub={`Ativos com mais de ${LIMITE_FERIAS_VENCIDAS} dias pendentes`} />
        <KpiCard label="Contrato Temporário" value={fmtPct(pctTemporario)} sub="% do quadro ativo" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Pirâmide Etária" sub="Distribuição por faixa etária e sexo" span2>
          <PyramidChart data={piramide} />
        </ChartCard>

        <ChartCard title="Sexo" sub="Distribuição do quadro">
          <PieSimple data={sexo} formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="PCD" sub="Pessoas com deficiência">
          <PieSimple data={pcd} formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Escolaridade" sub="Distribuição por nível de formação">
          <BarSimple data={escolaridade} horizontal formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Tempo de Empresa" sub="Colaboradores por faixa de tempo">
          <BarSimple data={tempoEmpresa} color="#1a1a1a" formatter={(v) => fmtInt(v)} />
        </ChartCard>

        <ChartCard title="Faixa Salarial" sub="Distribuição de colaboradores" span2>
          <BarSimple data={faixaSalarial} formatter={(v) => fmtInt(v)} />
        </ChartCard>
      </div>
    </>
  );
}
