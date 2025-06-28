const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required and must be less than 50 characters'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
  body('note').optional().isLength({ max: 200 }).withMessage('Note must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, type, date, note } = req.body;

    const transaction = new Transaction({
      amount,
      category,
      type,
      date: date || new Date(),
      note,
      userId: req.user._id
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get financial summary for the authenticated user
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count'
            }
          }
        }
      }
    ]);

    const income = summary.find(s => s._id === 'income')?.total || 0;
    const expenses = summary.find(s => s._id === 'expense')?.total || 0;
    const balance = income - expenses;

    const incomeCategories = categoryBreakdown.find(c => c._id === 'income')?.categories || [];
    const expenseCategories = categoryBreakdown.find(c => c._id === 'expense')?.categories || [];

    res.json({
      income,
      expenses,
      balance,
      incomeCategories,
      expenseCategories,
      totalTransactions: summary.reduce((acc, s) => acc + s.count, 0)
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
