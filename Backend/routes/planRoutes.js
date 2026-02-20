const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// GET plans (Filtered by Silo)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = { tenantId: req.user.tenantId }; // Basic Silo Lock

    // If STAFF, further restrict to only their OWN items within the silo
    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    }
    // If MANAGER, query remains { tenantId: req.user.tenantId }, seeing everyone in the group

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
      tenantId: req.user.tenantId, // Tag with the user's specific group ID
      description,
      amount,
      category, 
      priority: priority || "normal",
      notes,
      userId: req.user.id,
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
    
    // 2. Find the Plan and Ensure it belongs to the Manager's Silo
    const planToUpdate = await Plan.findOne({ _id: planId, tenantId: req.user.tenantId });
      
    if (!planToUpdate) {
      return res.status(404).json({ error: "Plan not found in your workspace" });
    }

    // 3. Logic: If approved, convert to an Expense
    if (status === "approved" && planToUpdate.status !== "approved") {
      const newExpense = new Expense({
        tenantId: planToUpdate.tenantId, // CRITICAL: Expense stays in the same Silo
        userId: planToUpdate.userId,     // Expense belongs to the original requester
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