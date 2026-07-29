export default function HealthScoreGauge({ score = 0, savingsRate = 0, volatility = 0 }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#1F7A5C' : score >= 40 ? '#B8863B' : '#B24B2C';

  return (
    <div className="border border-line rounded-lg p-6 bg-white/60 flex items-center gap-6 fade-in">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#DDD7C7" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl" style={{ color }}>{score}</span>
          <span className="text-[10px] text-inkmuted uppercase tracking-wide">score</span>
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg text-ink mb-1">Financial health score</h3>
        <p className="text-sm text-inkmuted mb-3">
          Composite of savings rate, spending stability, and anomaly frequency over the last 3 months.
        </p>
        <div className="flex gap-4 text-xs text-inkmuted">
          <span>Savings rate: <span className="text-ink font-mono">{savingsRate}%</span></span>
          <span>Volatility: <span className="text-ink font-mono">{volatility}%</span></span>
        </div>
      </div>
    </div>
  );
}
