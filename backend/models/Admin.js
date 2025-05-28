const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
  permissions: {
    type: [String],
    default: [],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
