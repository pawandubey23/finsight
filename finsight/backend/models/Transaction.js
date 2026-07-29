const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Rent',
  'Subscriptions',
  'Health',
  'Education',
  'Travel',
  'Income',
  'Other'
];

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true }, // positive = income, negative = expense
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    categorySource: { type: String, enum: ['ml', 'manual'], default: 'manual' },
    date: { type: Date, required: true, default: Date.now },
    isAnomaly: { type: Boolean, default: false },
    anomalyScore: { type: Number, default: 0 },
    isRecurring: { type: Boolean, default: false }
  },
  { timestamps: true }
);

TransactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
module.exports.CATEGORIES = CATEGORIES;
