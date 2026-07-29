const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const ml = require('../controllers/mlClient');

const router = express.Router();
router.use(auth);

// GET /api/transactions - list, with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, from, to, limit = 200 } = req.query;
    const query = { user: req.userId };
    if (category) query.category = category;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions - create, auto-categorize + anomaly check via ML service
router.post(
  '/',
  [
    body('description').trim().notEmpty(),
    body('amount').isNumeric(),
    body('date').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Description and a numeric amount are required' });
    }

    try {
      const { description, amount, date, category, isRecurring } = req.body;

      let finalCategory = category;
      let categorySource = 'manual';
      if (!finalCategory) {
        finalCategory = await ml.categorize(description);
        categorySource = 'ml';
      }

      // Pull recent history for anomaly comparison (last 90 days, same sign)
      const history = await Transaction.find({ user: req.userId })
        .sort({ date: -1 })
        .limit(100)
        .select('amount category date -_id');

      const { isAnomaly, score } = await ml.checkAnomaly(
        { amount, category: finalCategory, date: date || new Date() },
        history
      );

      const transaction = await Transaction.create({
        user: req.userId,
        description,
        amount,
        category: finalCategory,
        categorySource,
        date: date || new Date(),
        isAnomaly,
        anomalyScore: score,
        isRecurring: !!isRecurring
      });

      res.status(201).json(transaction);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create transaction' });
    }
  }
);

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;
