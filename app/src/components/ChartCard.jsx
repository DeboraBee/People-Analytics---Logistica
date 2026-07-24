export default function ChartCard({ title, sub, span2, note, children }) {
  return (
    <div className={`chart-card${span2 ? " span-2" : ""}`}>
      <div className="chart-card-title">{title}</div>
      {sub && <div className="chart-card-sub">{sub}</div>}
      {children}
      {note && <div className="sim-note">{note}</div>}
    </div>
  );
}
