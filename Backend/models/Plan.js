const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  // THE SILO: Connects the requester and the approver in the same household/enterprise
  tenantId: { 
    type: String, 
    required: true,
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
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
  // THE REQUESTER: The specific staff member or helper asking for funds
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  notes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Optimized Indexes for Multi-Tenancy
// 1. For Managers: To see the pending queue for their specific group
PlanSchema.index({ tenantId: 1, status: 1 });

// 2. For Staff: To see their own history within their group
PlanSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model("Plan", PlanSchema);