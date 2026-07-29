import { useEffect, useState } from 'react';
import api from '../api/client';
import StatCard from '../components/StatCard';
import HealthScoreGauge from '../components/HealthScoreGauge';
import CategoryChart from '../components/CategoryChart';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, healthRes, forecastRes, subsRes] = await Promise.all([
          api.get('/insights/summary'),
          api.get('/insights/health-score'),
          api.get('/insights/forecast'),
          api.get('/insights/subscriptions')
        ]);
        setSummary(summaryRes.data);
        setHealth(healthRes.data);
        setForecast(forecastRes.data);
        setSubscriptions(subsRes.data.subscriptions || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-16 text-inkmuted text-sm">Loading your dashboard…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">This month at a glance</h1>
        <p className="text-inkmuted text-sm mt-1">
          {summary?.transactionCount || 0} transactions logged so far.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Income" value={`₹${(summary?.income || 0).toFixed(2)}`} tone="emerald" />
        <StatCard label="Expenses" value={`₹${(summary?.expenses || 0).toFixed(2)}`} tone="rust" />
        <StatCard
          label="Net"
          value={`₹${(summary?.net || 0).toFixed(2)}`}
          tone={summary?.net >= 0 ? 'emerald' : 'rust'}
          sub={summary?.anomalies ? `${summary.anomalies} unusual transaction(s) flagged` : 'No anomalies detected'}
        />
      </div>

      {health && (
        <HealthScoreGauge score={health.score} savingsRate={health.savingsRate} volatility={health.volatility} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart byCategory={summary?.byCategory} />

        <div className="border border-line rounded-lg p-6 bg-white/60 fade-in">
          <h3 className="font-display text-lg text-ink mb-2">Next month's estimate</h3>
          {forecast?.next_month_estimate != null ? (
            <>
              <p className="font-mono text-2xl text-ink mb-4">₹{forecast.next_month_estimate.toFixed(2)}</p>
              <div className="space-y-1.5">
                {Object.entries(forecast.by_category || {}).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-inkmuted">{cat}</span>
                    <span className="font-mono text-ink">₹{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-inkmuted text-sm">Log a few more months of transactions for a forecast.</p>
          )}
        </div>
      </div>

      <div className="border border-line rounded-lg p-6 bg-white/60 fade-in">
        <h3 className="font-display text-lg text-ink mb-1">Detected subscriptions</h3>
        <p className="text-inkmuted text-sm mb-4">Recurring charges found automatically in your history.</p>
        {subscriptions.length === 0 ? (
          <p className="text-inkmuted text-sm">No recurring charges detected yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {subscriptions.map((s, i) => (
              <div key={i} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink">{s.description}</span>
                <span className="font-mono text-gold">
                  ₹{s.estimated_monthly_cost.toFixed(2)}/mo · ₹{s.estimated_yearly_cost.toFixed(2)}/yr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
