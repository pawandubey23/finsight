import { useState, useRef } from 'react';

const CATEGORIES = [
  'Food & Dining', 'Groceries', 'Transport', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Rent', 'Subscriptions', 'Health', 'Education',
  'Travel', 'Income', 'Other'
];

export default function AddTransactionForm({ onAdd }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(''); // empty = let ML decide
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const recognitionRef = useRef(null);

  const canUseVoice = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Try to pull a number out of speech like "spent 200 on lunch"
      const match = transcript.match(/(\d+(\.\d+)?)/);
      if (match) {
        setAmount(match[1]);
        setDescription(transcript.replace(match[1], '').replace(/rupees|rs\.?/gi, '').trim());
      } else {
        setDescription(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    setSubmitting(true);
    const signedAmount = type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
    await onAdd({
      description,
      amount: signedAmount,
      category: category || undefined
    });
    setDescription('');
    setAmount('');
    setCategory('');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-line rounded-lg p-5 bg-white/60 fade-in">
      <h3 className="font-display text-lg text-ink mb-4">Log a transaction</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Description (e.g. Swiggy dinner)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-line rounded px-3 py-2 text-sm bg-white pr-10"
            required
          />
          {canUseVoice && (
            <button
              type="button"
              onClick={startVoiceInput}
              title="Speak your expense"
              className={`absolute right-2 top-2 text-xs px-1.5 py-1 rounded ${
                listening ? 'text-rust' : 'text-inkmuted hover:text-ledger'
              }`}
            >
              {listening ? '● rec' : '🎤'}
            </button>
          )}
        </div>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-line rounded px-3 py-2 text-sm bg-white font-mono"
          required
        />
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-line rounded px-3 py-2 text-sm bg-white"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-line rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">Auto-categorize (ML)</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="ml-auto px-4 py-2 bg-ledger text-paper text-sm rounded hover:bg-emerald transition-colors disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
