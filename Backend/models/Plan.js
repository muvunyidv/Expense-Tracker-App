const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
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
  notes: { type: String } // Added this since our Modal has a notes field
}, { 
  timestamps: true // This replaces your manual createdAt field and adds updatedAt
});

module.exports = mongoose.model("Plan", PlanSchema);