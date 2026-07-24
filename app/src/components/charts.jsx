import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const PALETTE = [
  "#e4032e",
  "#1a1a1a",
  "#ff8a3d",
  "#6b7280",
  "#ffb703",
  "#8d99ae",
  "#c9184a",
  "#495057",
];

const AXIS_STYLE = { fontSize: 11, fill: "#6b7280", fontWeight: 600 };
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e4e6ea",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

export function BarSimple({ data, height = 230, horizontal = false, color = "#e4032e", formatter, barName }) {
  // eixo de categoria (Y no modo horizontal) esconde ticks por padrao quando
  // nao cabem todos - forcamos interval=0 (todos os rotulos) e calculamos a
  // altura do grafico a partir da quantidade de categorias, senao o numero
  // de barras e o numero de rotulos visiveis divergem.
  const rowHeight = 30;
  const chartHeight = horizontal ? Math.max(height, data.length * rowHeight + 40) : height;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" vertical={!horizontal} horizontal={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={110} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatter} />
        <Bar dataKey="value" name={barName || "Valor"} fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarMultiSeries({ data, keys, height = 230, formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
        <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatter} />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
        {keys.map((k, i) => (
          <Bar key={k.key} dataKey={k.key} name={k.label} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineSimple({ data, dataKey = "value", xKey = "name", height = 230, color = "#e4032e", formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 14, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
        <XAxis dataKey={xKey} tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={20} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatter} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieSimple({ data, height = 230, formatter, donut = true }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={donut ? 55 : 0}
          outerRadius={90}
          paddingAngle={2}
          isAnimationActive={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatter} />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ScatterSimple({ data, xKey, yKey, xLabel, yLabel, height = 260, color = "#e4032e" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 4, right: 14, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
        <XAxis type="number" dataKey={xKey} name={xLabel} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis type="number" dataKey={yKey} name={yLabel} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={data} fill={color} fillOpacity={0.55} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
