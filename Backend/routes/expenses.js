const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('categoryId', 'name');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id }).populate('categoryId', 'name');
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by category
router.get('/category/:categoryId', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id, categoryId: req.params.categoryId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense summary
router.get('/summary/all', authMiddleware, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', total: 1, _id: 0 } },
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;

    if (!categoryId || !amount || !date) {
      return res.status(400).json({ error: 'Category, amount, and date are required' });
    }

    const expense = new Expense({ userId: req.user.id, categoryId, amount, description, date });
    await expense.save();
    await expense.populate('categoryId', 'name');
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;

    if (!categoryId || !amount || !date) {
      return res.status(400).json({ error: 'Category, amount, and date are required' });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { categoryId, amount, description, date, updatedAt: new Date() },
      { new: true }
    ).populate('categoryId', 'name');
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
