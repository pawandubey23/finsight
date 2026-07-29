import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', monthlyIncome: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register({
      ...form,
      monthlyIncome: Number(form.monthlyIncome) || 0
    });
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm fade-in">
        <h1 className="font-display text-3xl text-ledger mb-1">Create your account</h1>
        <p className="text-inkmuted text-sm mb-8">Takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white"
            required
          />
          <input
            name="monthlyIncome"
            type="number"
            placeholder="Approx. monthly income (optional)"
            value={form.monthlyIncome}
            onChange={handleChange}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white font-mono"
          />
          {error && <p className="text-rust text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger text-paper py-2.5 rounded text-sm hover:bg-emerald transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-inkmuted mt-6">
          Already have an account? <Link to="/login" className="text-emerald hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
