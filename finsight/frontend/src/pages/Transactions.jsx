import { useEffect, useState } from 'react';
import api from '../api/client';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionList from '../components/TransactionList';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/transactions');
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (payload) => {
    await api.post('/transactions', payload);
    await load();
  };

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="font-display text-2xl text-ink">Transactions</h1>
      <AddTransactionForm onAdd={handleAdd} />
      {loading ? (
        <p className="text-inkmuted text-sm">Loading…</p>
      ) : (
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      )}
    </div>
  );
}
