// authUserModel.js
const mongoose = require('mongoose');
const Order = require('../Order/Order');

// Define the user schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  Orders:{
    type: Number,
    default: 0
  },
  TotalSpent:{
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;