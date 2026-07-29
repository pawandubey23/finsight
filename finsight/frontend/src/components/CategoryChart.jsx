import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1F7A5C', '#B8863B', '#B24B2C', '#5B6472', '#0F3D2E', '#8B9A8E', '#D2A85B', '#7A4A32'];

export default function CategoryChart({ byCategory }) {
  const data = Object.entries(byCategory || {}).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="border border-line rounded-lg p-6 bg-white/60 h-72 flex items-center justify-center text-inkmuted text-sm fade-in">
        No expenses logged this month yet
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg p-6 bg-white/60 fade-in">
      <h3 className="font-display text-lg text-ink mb-4">Spending by category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
