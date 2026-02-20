const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  // Changed from String to ObjectId to link with Category model
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ["low", "normal", "urgent"], 
    default: "normal" 
  },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  notes: { type: String }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Plan", PlanSchema);