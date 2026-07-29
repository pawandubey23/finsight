export default function TransactionList({ transactions, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="border border-line rounded-lg p-8 text-center text-inkmuted text-sm fade-in">
        No transactions yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg bg-white/60 divide-y divide-line fade-in">
      {transactions.map((t) => (
        <div key={t._id} className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {t.isAnomaly && (
              <span
                title={`Anomaly score ${Math.round(t.anomalyScore * 100)}%`}
                className="w-2 h-2 rounded-full bg-rust shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="text-sm text-ink truncate">{t.description}</div>
              <div className="text-xs text-inkmuted">
                {t.category} · {new Date(t.date).toLocaleDateString()}
                {t.categorySource === 'ml' && ' · auto-tagged'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className={`font-mono text-sm ${t.amount < 0 ? 'text-rust' : 'text-emerald'}`}>
              {t.amount < 0 ? '-' : '+'}₹{Math.abs(t.amount).toFixed(2)}
            </span>
            <button
              onClick={() => onDelete(t._id)}
              className="text-xs text-inkmuted hover:text-rust transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
