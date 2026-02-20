const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Register
// Added 'next' parameter to prevent "next is not a function" errors
router.post('/register', async (req, res, next) => {
  try {
    const { email, phonenumber, username, password, role, inviteCode } = req.body;

    if (!email || !phonenumber || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }, { phonenumber }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email, Username, or Phone already in use' });
    }

    let finalTenantId;

    if (role === 'manager') {
      // MANAGER: Generate a completely new unique Silo ID
      finalTenantId = new mongoose.Types.ObjectId().toString();
    } else {
      // STAFF: Must provide an invite code to find their Manager's Silo
      if (!inviteCode) {
        return res.status(400).json({ error: 'An invite code is required to join a team' });
      }

      const manager = await User.findOne({ 
        inviteCode: inviteCode.toUpperCase().trim(), 
        role: 'manager' 
      });

      if (!manager) {
        return res.status(404).json({ error: 'Invalid invite code. Check with your manager.' });
      }
      
      finalTenantId = manager.tenantId; // Inherit the group ID
    }

    // 2. Create the User
    const user = new User({ 
      email: email.toLowerCase(), 
      phonenumber, 
      username, 
      password, 
      role: role || 'staff',
      tenantId: finalTenantId
    });
    
    await user.save();

    // 3. Generate Token (Including tenantId for the silo logic)
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

    // 4. Respond
    res.status(201).json({ 
      user: user.toJSON(), 
      token,
      message: role === 'manager' 
        ? `Account created! Your invite code is ${user.inviteCode}` 
        : 'Successfully joined the team!'
    });

  } catch (error) {
    console.error("Registration Error:", error);
    // Directly send response to avoid 'next' confusion if middleware isn't setup
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