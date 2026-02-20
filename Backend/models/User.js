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
    enum: ['staff', 'manager', 'user'], 
    default: 'user'
  },
  /**
   * THE SILO:
   * Used to isolate data. For 'user' and 'manager', this defaults to their own _id.
   * For 'staff', this is inherited from their manager during registration.
   */
  tenantId: {
    type: String,
    index: true 
  },
  /**
   * THE KEY:
   * Sparse allows multiple null values for 'user' and 'staff' 
   * while maintaining uniqueness for 'manager' codes.
   */
  inviteCode: {
    type: String,
    unique: true,
    sparse: true 
  }
}, { timestamps: true });

/**
 * PRE-SAVE HOOK
 * Handles password hashing and dynamic Silo (tenantId) assignment.
 * Using async function without 'next' to avoid Mongoose middleware conflicts.
 */
userSchema.pre('save', async function () {
  try {
    // 1. Hash password if it's new or modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // 2. Set tenantId for Normal Users and Managers
    // If they are not 'staff', they are the "owner" of their own data silo.
    if ((this.role === 'user' || this.role === 'manager') && !this.tenantId) {
      this.tenantId = this._id.toString();
    }

    // 3. Generate Invite Code ONLY for Managers
    if (this.role === 'manager' && !this.inviteCode) {
      // Generates a 6-character readable hex code (e.g., A1B2C3)
      this.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    }
    
    // In async hooks, you don't call next(). Returning is enough.
  } catch (error) {
    throw error; // Re-throw to be caught by the route's catch block
  }
});

/**
 * VERIFY PASSWORD
 */
userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * SECURITY: Remove sensitive data before sending to frontend
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);