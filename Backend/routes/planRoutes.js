const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// GET plans (Filtered by Silo)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = { tenantId: req.user.tenantId };

    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    }

    const plans = await Plan.find(query)
      .populate("userId", "username")
      .populate("category", "name")
      .populate("reviewedBy", "username") // Added to see who reviewed it
      .sort({ updatedAt: -1 });
      
    res.json(plans);
  } catch (err) {
    console.error("GET Plans Error:", err);
    res.status(500).json({ error: "Server error fetching requirements" });
  }
});

// POST a new plan (No changes needed here, approvedAmount defaults to 0)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category, priority, notes } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPlan = new Plan({
      tenantId: req.user.tenantId,
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

// PATCH update plan status & amount (Manager Only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Access denied. Managers only." });
    }

    // Capture the new fields from the manager's input
    const { status, approvedAmount, managerComment } = req.body;
    const planId = req.params.id;
    
    const planToUpdate = await Plan.findOne({ _id: planId, tenantId: req.user.tenantId });
      
    if (!planToUpdate) {
      return res.status(404).json({ error: "Plan not found in your workspace" });
    }

    // LOGIC: If approved, convert to an Expense using the APPROVED amount
    if (status === "approved" && planToUpdate.status !== "approved") {
      // Use the provided approvedAmount, or fallback to full amount if not provided
      const finalAmount = approvedAmount !== undefined ? approvedAmount : planToUpdate.amount;

      const newExpense = new Expense({
        tenantId: planToUpdate.tenantId,
        userId: planToUpdate.userId,    
        categoryId: planToUpdate.category, 
        amount: finalAmount, // CRITICAL: This is the updated amount
        description: `[Req-Approved] ${planToUpdate.description}`,
        notes: managerComment || `Approved by ${req.user.username}`,
        date: new Date()
      });

      await newExpense.save();
    }

    // Update the Plan with the decision details
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { 
        status, 
        approvedAmount: status === "approved" ? (approvedAmount || planToUpdate.amount) : 0,
        managerComment,
        reviewedBy: req.user.id // Track the manager
      },
      { new: true }
    )
    .populate("userId", "username")
    .populate("category", "name")
    .populate("reviewedBy", "username");

    res.json({ 
      message: status === "approved" ? "Request authorized and logged as expense" : `Request ${status}`, 
      plan: updatedPlan 
    });

  } catch (err) {
    console.error("PATCH Status Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;