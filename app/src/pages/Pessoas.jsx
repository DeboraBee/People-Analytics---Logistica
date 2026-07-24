import { useFilters } from "../context/FilterContext";
import ChartCard from "../components/ChartCard";
import { BarSimple, PieSimple } from "../components/charts";
import PyramidChart from "../components/PyramidChart";
import { groupCount, sortDesc, fmtInt } from "../utils/aggregate";
import { buildPyramid, orderFaixaSalarial, bucketTempoEmpresa } from "../utils/pyramid";

export default function Pessoas() {
  const { filtered } = useFilters();

  const piramide = buildPyramid(filtered);
  const escolaridade = sortDesc(groupCount(filtered, "escolaridade"));
  const sexo = groupCount(filtered, "sexo");
  const pcd = groupCount(filtered, "pcd");
  const tempoEmpresa = bucketTempoEmpresa(filtered);
  const faixaSalarial = orderFaixaSalarial(groupCount(filtered, "faixa_salarial"));

  return (
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
  );
}
