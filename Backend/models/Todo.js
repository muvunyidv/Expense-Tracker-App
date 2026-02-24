const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: { 
    type: String, 
    required: true,
    trim: true 
  },
  cost: {
    type: Number,
    required: false,
    default: 0,
    min: 0 // Prevents entering negative financial values
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: false 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  },
  tenantId: { 
    type: String, 
    required: true, 
    index: true 
  },
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);