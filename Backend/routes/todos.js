const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// GET all todos for the user's silo (tenantId)
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST a new todo
router.post('/', auth, async (req, res) => {
  try {
    const newTodo = new Todo({
      ...req.body,
      tenantId: req.user.tenantId,
      recordedBy: req.user.id
    });
    const saved = await newTodo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH status toggle
router.patch('/:id', auth, async (req, res) => {
  try {
    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
});

// DELETE todo
router.delete('/:id', auth, async (req, res) => {
  try {
    await Todo.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

module.exports = router;