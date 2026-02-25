const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/* ================================
   Get expense summary (by category)
   Reflects total approved spending
================================ */
router.get('/summary/all', async (req, res) => {
  try {
    // MANAGER see group total; STAFF see personal total
    const matchQuery = req.user.role === 'manager' 
      ? { tenantId: req.user.tenantId } 
      : { userId: new mongoose.Types.ObjectId(req.user.id), tenantId: req.user.tenantId };

    const summary = await Expense.aggregate([
      { $match: matchQuery },
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
   Get all expenses (Filtered by Tenant)
   Now populates userId for "Recorded by" feature
================================ */
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    // Logic: Managers see ALL group expenses, Staff see only their OWN
    const query = req.user.role === 'manager'
      ? { tenantId: req.user.tenantId }
      : { userId: req.user.id, tenantId: req.user.tenantId };

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(Math.min(parseInt(limit), 200))
      .skip(parseInt(offset))
      .populate('categoryId', 'name')
      .populate('userId', 'username'); // CRITICAL: Populates the name of the person who added it

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Create manual expense
================================ */
router.post('/', async (req, res) => {
  try {
    const { categoryId, amount, description, notes, date } = req.body;

    if (!categoryId || amount == null) {
      return res.status(400).json({ error: 'Category and amount are required' });
    }

    const category = await Category.findOne({
      _id: categoryId,
      tenantId: req.user.tenantId
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category for your group' });
    }

    const expense = new Expense({
      tenantId: req.user.tenantId, 
      userId: req.user.id, // Linking the current user
      categoryId,
      amount,
      description,
      notes,
      date: date || new Date()
    });

    await expense.save();
    
    // Populate both fields so the frontend gets the names immediately
    await expense.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'userId', select: 'username' }
    ]);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Get expense by ID
================================ */
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    })
    .populate('categoryId', 'name')
    .populate('userId', 'username');

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================================
   Update expense
================================ */
router.put('/:id', async (req, res) => {
  try {
    const { categoryId, amount, description, notes, date } = req.body;

    const updateQuery = req.user.role === 'manager'
      ? { _id: req.params.id, tenantId: req.user.tenantId }
      : { _id: req.params.id, userId: req.user.id, tenantId: req.user.tenantId };

    const expense = await Expense.findOneAndUpdate(
      updateQuery,
      { categoryId, amount, description, notes, date },
      { new: true }
    )
    .populate('categoryId', 'name')
    .populate('userId', 'username'); // Maintain user info on update

    if (!expense) return res.status(404).json({ error: 'Expense not found or unauthorized' });

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
    const deleteQuery = req.user.role === 'manager'
      ? { _id: req.params.id, tenantId: req.user.tenantId }
      : { _id: req.params.id, userId: req.user.id, tenantId: req.user.tenantId };

    const expense = await Expense.findOneAndDelete(deleteQuery);

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;