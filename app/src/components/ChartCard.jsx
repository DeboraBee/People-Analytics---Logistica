export default function ChartCard({ title, sub, span2, children }) {
  return (
    <div className={`chart-card${span2 ? " span-2" : ""}`}>
      <div className="chart-card-title">{title}</div>
      {sub && <div className="chart-card-sub">{sub}</div>}
      {children}
    </div>
  );
}
