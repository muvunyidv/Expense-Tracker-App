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
    ref: "User", // This links the plan to the staff member who created it
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Plan", PlanSchema);    