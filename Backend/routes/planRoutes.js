const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
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
      category,
      priority: priority || "normal",
      notes,
      userId: req.user.id, 
      status: "pending"
    });

    await newPlan.save();
    
    const populatedPlan = await Plan.findById(newPlan._id).populate("userId", "username");
    res.json(populatedPlan);
  } catch (err) {
    console.error("POST Plan Error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// PATCH update plan status (Manager Only)
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

    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "username");

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