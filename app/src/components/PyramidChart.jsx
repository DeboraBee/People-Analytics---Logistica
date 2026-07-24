import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AXIS_STYLE = { fontSize: 11, fill: "#6b7280", fontWeight: 600 };
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e4e6ea",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

export default function PyramidChart({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" stackOffset="sign" margin={{ top: 4, right: 14, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
        <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={(v) => Math.abs(v)} />
        <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={50} interval={0} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => Math.abs(v)} />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
        <Bar dataKey="Masculino" stackId="s" fill="#1a1a1a" radius={[0, 0, 0, 0]} maxBarSize={22} isAnimationActive={false} />
        <Bar dataKey="Feminino" stackId="s" fill="#e4032e" radius={[0, 0, 0, 0]} maxBarSize={22} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
