const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, phonenumber, username, password, role, inviteCode } = req.body;

    // Basic validation
    if (!email || !phonenumber || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Check if user already exists (Check all unique fields)
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() }, 
        { username: username }, 
        { phonenumber: phonenumber }
      ] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email, Username, or Phone number already in use' });
    }

    let assignedRole = role || 'user';
    let finalTenantId = undefined;

    // 2. Role-based logic for Tenant/Silo
    if (assignedRole === 'staff') {
      // STAFF: Must provide an invite code to inherit a Manager's Silo
      if (!inviteCode) {
        return res.status(400).json({ error: 'An invite code is required to join a team' });
      }

      const manager = await User.findOne({ 
        inviteCode: inviteCode.toUpperCase().trim(), 
        role: 'manager' 
      });

      if (!manager) {
        return res.status(404).json({ error: 'Invalid invite code. Please check with your manager.' });
      }
      
      finalTenantId = manager.tenantId; // Inherit the manager's silo ID
    } 
    // NOTE: For 'manager' and 'user', finalTenantId stays undefined here.
    // The User Model pre-save hook will automatically set tenantId = user._id.

    // 3. Create the User instance
    const user = new User({ 
      email: email.toLowerCase(), 
      phonenumber, 
      username, 
      password, 
      role: assignedRole,
      tenantId: finalTenantId
    });
    
    // The .save() call triggers the pre-save hook in models/User.js
    await user.save();

    // 4. Generate JWT Token
    // We use the freshly saved user data (including the auto-generated tenantId)
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role, 
        tenantId: user.tenantId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Success Response
    let successMessage = 'Account created successfully!';
    if (user.role === 'manager') successMessage = `Team created! Your invite code is ${user.inviteCode}`;
    if (user.role === 'staff') successMessage = 'Successfully joined the team!';

    res.status(201).json({ 
      user: user.toJSON(), 
      token,
      message: successMessage
    });

  } catch (error) {
    console.error("Registration Error:", error);
    // Handle Mongoose validation errors specifically if needed
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // Support login via email or phone number
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() }, 
        { phonenumber: identifier }
      ]
    });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role, 
        tenantId: user.tenantId 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ user: user.toJSON(), token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Current User Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;