const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/* ================================
   Get expense summary (by category)
================================ */
router.get('/summary/all', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          total: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Get expenses by category
================================ */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const expenses = await Expense.find({
      userId: req.user.id,
      categoryId
    })
      .sort({ date: -1 })
      .populate('categoryId', 'name');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Get all expenses (paginated)
================================ */
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 100, 200);
    const parsedOffset = parseInt(offset) || 0;

    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(parsedLimit)
      .skip(parsedOffset)
      .populate('categoryId', 'name');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Get expense by ID
================================ */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const expense = await Expense.findOne({
      _id: id,
      userId: req.user.id
    }).populate('categoryId', 'name');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Create expense
================================ */
router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;

    if (!categoryId || amount == null || !date) {
      return res.status(400).json({
        error: 'Category, amount, and date are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Validate category ownership
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.id
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const expense = new Expense({
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date
    });

    await expense.save();
    await expense.populate('categoryId', 'name');

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Update expense
================================ */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, amount, description, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    if (!categoryId || amount == null || !date) {
      return res.status(400).json({
        error: 'Category, amount, and date are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Validate category ownership
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.user.id
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { categoryId, amount, description, date },
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

/* ================================
   Delete expense
================================ */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
