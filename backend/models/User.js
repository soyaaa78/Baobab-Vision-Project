const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, unique:true, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

});

module.exports = mongoose.model('User', userSchema);
