const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phonenumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['staff', 'manager'],
    default: 'staff'
  },
  // THE SILO: Linked to the Manager's unique ID
  tenantId: {
    type: String,
    required: true,
    index: true 
  },
  // THE KEY: Generated for Managers, used by Staff to join
  inviteCode: {
    type: String,
    unique: true,
    sparse: true // Essential: allows null for staff while keeping uniqueness for managers
  }
}, { timestamps: true });

/**
 * PRE-SAVE HOOK
 * Cleaned up 'next' usage. In async hooks, simply allowing the function 
 * to complete acts as 'next()'. Throwing an error acts as 'next(err)'.
 */
userSchema.pre('save', async function () {
  try {
    // 1. Hash password if it's new or being changed
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // 2. Generate Invite Code only for Managers if they don't have one
    if (this.role === 'manager' && !this.inviteCode) {
      // Generates a 6-character random hex code (e.g., "F3A2B1")
      this.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    }
  } catch (error) {
    // Throwing here correctly passes the error to the .save().catch() or route catch block
    throw error;
  }
});

/**
 * VERIFY PASSWORD
 * Standard async method for login comparison
 */
userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * SECURITY: toJSON
 * Ensures sensitive data like passwords are never sent to the frontend
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);