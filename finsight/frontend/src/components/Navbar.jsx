import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-display text-xl text-ledger tracking-tight">
          FinSight
        </Link>
        {user && (
          <div className="flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="text-inkmuted hover:text-ink transition-colors">
              Dashboard
            </Link>
            <Link to="/transactions" className="text-inkmuted hover:text-ink transition-colors">
              Transactions
            </Link>
            <span className="text-inkmuted">{user.name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3 py-1.5 border border-line rounded text-inkmuted hover:border-rust hover:text-rust transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
