const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const ml = require('../controllers/mlClient');
const User = require('../models/User');

const router = express.Router();
router.use(auth);

// GET /api/insights/summary - totals + category breakdown for current month
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthTx = await Transaction.find({ user: req.userId, date: { $gte: startOfMonth } });

    const income = monthTx.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const byCategory = {};
    monthTx
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
      });

    const anomalies = monthTx.filter((t) => t.isAnomaly).length;

    res.json({
      income,
      expenses,
      net: income - expenses,
      byCategory,
      anomalies,
      transactionCount: monthTx.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute summary' });
  }
});

// GET /api/insights/health-score - composite financial health score (0-100)
router.get('/health-score', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const recent = await Transaction.find({ user: req.userId, date: { $gte: since } });

    const income = recent.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0) || user.monthlyIncome * 3;
    const expenses = recent.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const savingsRate = income > 0 ? Math.max(0, (income - expenses) / income) : 0;

    // volatility: coefficient of variation of monthly expense totals
    const monthlyTotals = {};
    recent
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
        monthlyTotals[key] = (monthlyTotals[key] || 0) + Math.abs(t.amount);
      });
    const totals = Object.values(monthlyTotals);
    const mean = totals.reduce((a, b) => a + b, 0) / (totals.length || 1);
    const variance = totals.reduce((a, b) => a + (b - mean) ** 2, 0) / (totals.length || 1);
    const stdDev = Math.sqrt(variance);
    const volatility = mean > 0 ? Math.min(1, stdDev / mean) : 0;

    const anomalyRate = recent.length > 0 ? recent.filter((t) => t.isAnomaly).length / recent.length : 0;

    // Weighted composite: savings 50%, low volatility 30%, low anomalies 20%
    const score = Math.round(
      (savingsRate * 0.5 + (1 - volatility) * 0.3 + (1 - anomalyRate) * 0.2) * 100
    );

    res.json({
      score: Math.max(0, Math.min(100, score)),
      savingsRate: Math.round(savingsRate * 100),
      volatility: Math.round(volatility * 100),
      anomalyRate: Math.round(anomalyRate * 100)
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute health score' });
  }
});

// GET /api/insights/forecast - delegates to ML microservice
router.get('/forecast', async (req, res) => {
  try {
    const history = await Transaction.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(500)
      .select('amount category date -_id');

    const result = await ml.forecast(history);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute forecast' });
  }
});

// GET /api/insights/subscriptions - recurring charge detection
router.get('/subscriptions', async (req, res) => {
  try {
    const history = await Transaction.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(500)
      .select('description amount category date -_id');

    const subscriptions = await ml.detectSubscriptions(history);
    res.json({ subscriptions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to detect subscriptions' });
  }
});

module.exports = router;
