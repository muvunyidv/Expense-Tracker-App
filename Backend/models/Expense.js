const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  // THE SILO: Ensures this expense stays within the specific Home or Company
  tenantId: { 
    type: String, 
    required: true,
    index: true 
  },
  // THE OWNER: Tracks which specific person (Staff or Manager) made the purchase
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  notes: { 
    type: String, 
    default: '',
    trim: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Optimized Multi-Tenant Indexes
// 1. For the Dashboard: Fetching a user's personal expenses within their group
expenseSchema.index({ tenantId: 1, userId: 1, date: -1 });

// 2. For the Manager/Owner: Fetching group-wide analytics by category
expenseSchema.index({ tenantId: 1, categoryId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);