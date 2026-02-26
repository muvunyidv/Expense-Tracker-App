const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Plan = require("../models/Plan");
const Expense = require("../models/Expense");
const Category = require("../models/Category");
const authMiddleware = require("../middleware/auth");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. GET plans (Filtered by Silo)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let query = { tenantId: req.user.tenantId };

    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    }

    const plans = await Plan.find(query)
      .populate("userId", "username")
      .populate("category", "name")
      .populate("reviewedBy", "username")
      .sort({ updatedAt: -1 });
      
    res.json(plans);
  } catch (err) {
    console.error("GET Plans Error:", err);
    res.status(500).json({ error: "Server error fetching requirements" });
  }
});

// 2. POST a new plan
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category, priority, notes } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Amount must be a valid positive number" });
    }

    const categoryDoc = await Category.findOne({ _id: category, tenantId: req.user.tenantId });
    if (!categoryDoc) {
      return res.status(400).json({ error: "Invalid category for your workspace" });
    }

    const newPlan = new Plan({
      tenantId: req.user.tenantId,
      description: description.trim(),
      amount: numericAmount,
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

/**
 * 3. PATCH update plan (General Edit)
 * This fixes the "Route not found" error when clicking "Update Request"
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { description, amount, category, priority, notes } = req.body;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    if (!description?.trim() || amount == null || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!isValidObjectId(category)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Amount must be a valid positive number" });
    }

    const categoryDoc = await Category.findOne({ _id: category, tenantId: req.user.tenantId });
    if (!categoryDoc) {
      return res.status(400).json({ error: "Invalid category for your workspace" });
    }
    
    // Ensure the user owns the plan OR is a manager
    let query = { _id: req.params.id, tenantId: req.user.tenantId };
    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    }

    const plan = await Plan.findOne(query);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found or unauthorized" });
    }

    // Only allow editing if it's still pending
    if (plan.status !== "pending" && req.user.role !== "manager") {
      return res.status(400).json({ error: "Cannot edit a request that has already been reviewed" });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { description: description.trim(), amount: numericAmount, category, priority, notes },
      { new: true, runValidators: true }
    ).populate("userId", "username").populate("category", "name");

    res.json(updatedPlan);
  } catch (err) {
    console.error("PATCH Plan Error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

// 4. DELETE a plan
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    let query = { _id: req.params.id, tenantId: req.user.tenantId };
    
    // Users can only delete their own plans; managers can delete any in their tenant
    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    }

    const plan = await Plan.findOneAndDelete(query);
    
    if (!plan) {
      return res.status(404).json({ error: "Plan not found or unauthorized" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("DELETE Plan Error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

// 5. PATCH update plan status & amount (Manager Decision)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Access denied. Managers only." });
    }

    const { status, approvedAmount, managerComment } = req.body;
    const planId = req.params.id;
    const allowedStatuses = new Set(["approved", "rejected", "pending"]);

    if (!isValidObjectId(planId)) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    const planToUpdate = await Plan.findOne({ _id: planId, tenantId: req.user.tenantId });
      
    if (!planToUpdate) {
      return res.status(404).json({ error: "Plan not found in your workspace" });
    }

    if (status === "approved" && planToUpdate.status !== "approved") {
      const finalAmount = approvedAmount !== undefined ? approvedAmount : planToUpdate.amount;
      const numericFinalAmount = Number(finalAmount);
      if (!Number.isFinite(numericFinalAmount) || numericFinalAmount < 0) {
        return res.status(400).json({ error: "Approved amount must be a valid non-negative number" });
      }

      const newExpense = new Expense({
        tenantId: planToUpdate.tenantId,
        userId: planToUpdate.userId,    
        categoryId: planToUpdate.category, 
        amount: numericFinalAmount,
        description: `[Req-Approved] ${planToUpdate.description}`,
        notes: managerComment || `Approved by ${req.user.username}`,
        date: new Date()
      });

      await newExpense.save();
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      { 
        status, 
        approvedAmount: status === "approved" ? Number(approvedAmount ?? planToUpdate.amount) : 0,
        managerComment,
        reviewedBy: req.user.id 
      },
      { new: true, runValidators: true }
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
