const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all todos
router.get('/', auth, async (req, res) => {
  try {
    // Added .populate to send back the username for the UI
    const todos = await Todo.find({ tenantId: req.user.tenantId })
      .populate('recordedBy', 'username') 
      .sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST a new todo
router.post('/', auth, async (req, res) => {
  try {
    const { task, cost, startDate, endDate } = req.body;
    const numericCost = Number(cost ?? 0);

    if (!task?.trim()) {
      return res.status(400).json({ message: "Task is required." });
    }
    if (!startDate) {
      return res.status(400).json({ message: "Start date is required." });
    }
    if (!Number.isFinite(numericCost) || numericCost < 0) {
      return res.status(400).json({ message: "Cost must be a valid non-negative number." });
    }
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: "End date must be later than start date." });
    }

    const newTodo = new Todo({
      task: task.trim(),
      cost: numericCost,
      startDate,
      endDate: endDate || undefined,
      tenantId: req.user.tenantId,
      // Ensure we use the ID from the auth middleware
      recordedBy: req.user._id || req.user.id 
    });
    const saved = await newTodo.save();
    // Return populated so UI has user info immediately
    const populated = await saved.populate('recordedBy', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH status
router.patch('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const existingTodo = await Todo.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!existingTodo) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Use .equals() for reliable ObjectId comparison
    const userId = req.user._id || req.user.id;
    if (!existingTodo.recordedBy.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to update this task." });
    }

    if (existingTodo.status === 'completed') {
      return res.status(400).json({ message: "Completed tasks are locked." });
    }

    if (req.body.status && !['pending', 'completed'].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    existingTodo.status = req.body.status || existingTodo.status;
    const updated = await existingTodo.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
});

// DELETE todo
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const todo = await Todo.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!todo) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = req.user._id || req.user.id;
    if (!todo.recordedBy.equals(userId)) {
      return res.status(403).json({ message: "Access Denied: Ownership required." });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

module.exports = router;
