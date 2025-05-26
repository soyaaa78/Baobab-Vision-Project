// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  profileImage: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
