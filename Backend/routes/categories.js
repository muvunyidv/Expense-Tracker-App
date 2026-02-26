const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * PERMISSION CHECK UTILITY
 * Managers and Personal Users can manage categories.
 * Staff can only view them.
 */
const canManageCategory = (role) => {
  return role === 'manager' || role === 'user';
};

// GET all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Filter by tenantId ensures Personal Users see their own 
    // and Team members see their group's categories.
    const categories = await Category.find({ tenantId: req.user.tenantId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET category by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

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

// POST Create category
router.post('/', authMiddleware, async (req, res) => {
  try {
    // UPDATED: Allow both Managers and Personal Users
    if (!canManageCategory(req.user.role)) {
      return res.status(403).json({ error: 'Staff members cannot create categories' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const category = new Category({
      tenantId: req.user.tenantId, 
      createdBy: req.user.id,      
      name: name.trim(),
      description
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This category already exists in your workspace' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT Update category
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // UPDATED: Allow both Managers and Personal Users
    if (!canManageCategory(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Staff cannot edit categories' });
    }

    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

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
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This category already exists in your workspace' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // UPDATED: Allow both Managers and Personal Users
    if (!canManageCategory(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Staff cannot delete categories' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
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
