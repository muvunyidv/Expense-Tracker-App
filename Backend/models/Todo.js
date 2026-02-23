const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  task: { 
    type: String, 
    required: true,
    trim: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
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