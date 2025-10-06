const mongoose = require('mongoose');
const { verifyPassword } = require('../utils/passwordUtils');

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
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Method to compare password using salt and hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  return verifyPassword(candidatePassword, this.salt, this.password);
};

module.exports = mongoose.model('User', userSchema); 