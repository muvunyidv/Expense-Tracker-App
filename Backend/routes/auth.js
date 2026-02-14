const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // 1. Removed email from destructuring
    const { phonenumber, username, password } = req.body;

    // 2. Updated validation check
    if (!phonenumber || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 3. Check for existing username (removed email check)
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // 4. Create user without email
    const user = new User({ phonenumber, username, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user: user.toJSON(), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // 5. Switch from email to username for login
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 6. Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 7. Updated JWT payload to use username instead of email
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ user: user.toJSON(), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;