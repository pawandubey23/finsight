export default function StatCard({ label, value, tone = 'ink', sub }) {
  const toneClass = {
    ink: 'text-ink',
    emerald: 'text-emerald',
    rust: 'text-rust',
    gold: 'text-gold'
  }[tone];

  return (
    <div className="border border-line rounded-lg p-5 bg-white/60 fade-in">
      <div className="text-xs uppercase tracking-wide text-inkmuted mb-2">{label}</div>
      <div className={`font-mono text-2xl ${toneClass}`}>{value}</div>
      {sub && <div className="text-xs text-inkmuted mt-1">{sub}</div>}
    </div>
  );
}
