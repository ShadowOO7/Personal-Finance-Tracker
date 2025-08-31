const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Create transaction

router.post('/', async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;
    if (!type || !amount) {
      return res.status(400).json({ error: 'type and amount required' });
    }
    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'amount must be a number' });
    }
    const tx = new Transaction({ type, amount, category, description, date, userId: new mongoose.Types.ObjectId(req.user) });
    await tx.save();
    res.json(tx);
  } catch (err) {
    next(err);
  }
});

// List transactions with optional date range, pagination, type filter
router.get('/', async (req, res, next) => {
  try {
    let { from, to, type, page, limit } = req.query;
    const filter = { userId: new mongoose.Types.ObjectId(req.user) };
    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;
    const skip = (page-1)*limit;
    const total = await Transaction.countDocuments(filter);
    const items = await Transaction.find(filter).sort({date:-1}).skip(skip).limit(limit);
    res.json({ page, limit, total, items });
  } catch (err) {
    next(err);
  }
});

// Summary: expenses by category and by date (daily sums)
router.get('/summary', async (req, res, next) => {
  try {
    let { from, to } = req.query;
    const match = { userId: new mongoose.Types.ObjectId(req.user) };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }
    // Aggregate expenses by category
    const byCategory = await Transaction.aggregate([
      { $match: match },
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    // Aggregate expenses by date (day)
    const byDate = await Transaction.aggregate([
      { $match: match },
      { $match: { type: 'expense' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ byCategory, byDate });
  } catch (err) {
    next(err);
  }
});

// Delete transaction
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Transaction.findOneAndDelete({ _id: id, userId: new mongoose.Types.ObjectId(req.user) });
    if (!result) {
      return res.status(404).json({ error: 'Transaction not found or not authorized' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
