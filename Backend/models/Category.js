const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // THE GROUP OWNER: Categories are now shared across the whole Company/Home
  tenantId: { 
    type: String, 
    required: true,
    index: true 
  },
  // Optional: Keep track of who originally created the category
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

// UNIQUE CONSTRAINT CHANGE:
// Prevents duplicate names WITHIN the same Home/Company. 
// Manager A can have "Food", and Home Owner B can have "Food", 
// but Manager A cannot have two "Food" categories.
categorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);