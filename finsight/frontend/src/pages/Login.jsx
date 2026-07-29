import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm fade-in">
        <h1 className="font-display text-3xl text-ledger mb-1">FinSight</h1>
        <p className="text-inkmuted text-sm mb-8">Your money, understood.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded px-3 py-2.5 text-sm bg-white"
            required
          />
          {error && <p className="text-rust text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ledger text-paper py-2.5 rounded text-sm hover:bg-emerald transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-inkmuted mt-6">
          New here? <Link to="/register" className="text-emerald hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
