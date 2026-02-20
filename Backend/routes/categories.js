const express = require('express');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET all categories for the shared group (Home or Company)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filter by tenantId so everyone in the silo sees the same categories
    const categories = await Category.find({ tenantId: req.user.tenantId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET category by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found in your workspace' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Create category (Manager/Owner Only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Optional: Only allow Managers/Owners to define categories to keep things organized
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Only Managers or Home Owners can create categories' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = new Category({
      tenantId: req.user.tenantId, // Linked to the shared group
      createdBy: req.user.id,      // Keep track of who made it
      name: name.trim(),
      description
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This category already exists in your group' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT Update category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { name: name.trim(), description },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const category = await Category.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user.tenantId 
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;