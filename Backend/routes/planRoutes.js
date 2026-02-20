const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const authMiddleware = require("../middleware/auth");

// GET all plans
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Sorting by newest first (-1)
    const plans = await Plan.find()
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
    
    // Validation: ensure required fields are present
    if (!description || !amount || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPlan = new Plan({
      description,
      amount,
      category,
      priority: priority || "normal",
      notes,
      userId: req.user.id, // Set by your auth middleware
      status: "pending"    // Default status for new requests
    });

    await newPlan.save();
    
    // Populate username before sending back so UI updates smoothly
    const populatedPlan = await Plan.findById(newPlan._id).populate("userId", "username");
    res.json(populatedPlan);
  } catch (err) {
    console.error("POST Plan Error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

module.exports = router;