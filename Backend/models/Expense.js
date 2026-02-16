const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
  // This acts as the "Expense Title" (e.g., "Grocery Shopping")
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  // This acts as the separate "Description / Notes" field you added to the form
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

// Optimized Indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);