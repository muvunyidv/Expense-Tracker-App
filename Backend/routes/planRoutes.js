const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// GET plans
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "manager") {
      // MANAGER VIEW: 
      // Managers need to see everything to manage the team.
      // 1. All Pending requests (The Queue)
      // 2. All Approved/Rejected history (The Audit Trail)
      query = {}; // Empty object finds all plans in the collection
    } else {
      // STAFF/NORMAL USER VIEW: 
      // Only see their own requests (Pending, Approved, or Rejected).
      query = { userId: req.user.id };
    }

    const plans = await Plan.find(query)
      .populate("userId", "username")
      .populate("category", "name")
      .sort({ updatedAt: -1 });
      
    res.json(plans);
  } catch (err) {
    console.error("GET Plans Error:", err);
    res.status(500).json({ error: "Server error fetching requirements" });
  }
});

// POST a new plan
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category, priority, notes } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPlan = new Plan({
      description,
      amount,
      category, 
      priority: priority || "normal",
      notes,
      userId: req.user.id, // The person creating the request
      status: "pending"
    });

    await newPlan.save();
    
    const populatedPlan = await Plan.findById(newPlan._id)
      .populate("userId", "username")
      .populate("category", "name");

    res.json(populatedPlan);
  } catch (err) {
    console.error("POST Plan Error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// PATCH update plan status (Manager Only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    // 1. Role Security Check
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Access denied. Managers only." });
    }

    const { status } = req.body;
    const planId = req.params.id;
    
    // 2. Find the Plan
    const planToUpdate = await Plan.findById(planId);
      
    if (!planToUpdate) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // 3. Logic: If approved, convert to an Expense
    // Important: We link the expense to the original requester (planToUpdate.userId)
    if (status === "approved" && planToUpdate.status !== "approved") {
      const newExpense = new Expense({
        userId: planToUpdate.userId, 
        categoryId: planToUpdate.category, 
        amount: planToUpdate.amount,
        description: `[Approved] ${planToUpdate.description}`,
        notes: planToUpdate.notes || `Approved by ${req.user.username}`,
        date: new Date()
      });

      await newExpense.save();
    }

    // 4. Update the Plan status
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { status },
      { new: true }
    )
    .populate("userId", "username")
    .populate("category", "name");

    res.json({ 
      message: status === "approved" ? "Plan approved and added to expenses" : `Plan marked as ${status}`, 
      plan: updatedPlan 
    });

  } catch (err) {
    console.error("PATCH Status Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;