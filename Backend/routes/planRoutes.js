const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

// GET plans (Filtered by Role)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = {};

    // ROLE LOGIC: If the user is not a manager, only show their own plans
    if (req.user.role !== "manager") {
      query = { userId: req.user.id };
    }

    const plans = await Plan.find(query)
      .populate("userId", "username")
      .populate("category", "name") // Added to show category name in UI
      .sort({ createdAt: -1 }); 
      
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
      category, // Storing the ObjectId from AddPlanModal
      priority: priority || "normal",
      notes,
      userId: req.user.id, 
      status: "pending"
    });

    await newPlan.save();
    
    const populatedPlan = await Plan.findById(newPlan._id)
      .populate("userId", "username")
      .populate("category", "name"); // Added for immediate UI update

    res.json(populatedPlan);
  } catch (err) {
    console.error("POST Plan Error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// PATCH update plan status (Manager Only) + Move to Expenses
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    // Security Check: Only managers can approve/reject
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Access denied. Managers only." });
    }

    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const planId = req.params.id;

    // LOGIC: If approved, move to Expenses collection
    if (status === "approved") {
      const planToMove = await Plan.findById(planId);
      
      if (!planToMove) {
        return res.status(404).json({ error: "Plan not found" });
      }

      // 1. Create the Expense record
      const newExpense = new Expense({
        userId: planToMove.userId,
        categoryId: planToMove.category, // This works because Plan now stores ObjectId
        amount: planToMove.amount,
        description: planToMove.description,
        notes: planToMove.notes || '',
        date: new Date()
      });

      await newExpense.save();

      // 2. Delete the Plan from the queue
      await Plan.findByIdAndDelete(planId);

      return res.json({ 
        message: "Plan approved and moved to expenses", 
        status: "approved",
        movedToExpenses: true 
      });
    }

    // Normal behavior for Rejection or Pending
    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { status },
      { new: true }
    )
    .populate("userId", "username")
    .populate("category", "name"); // Added to keep UI consistent on status change

    if (!updatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(updatedPlan);
  } catch (err) {
    console.error("PATCH Status Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

module.exports = router;