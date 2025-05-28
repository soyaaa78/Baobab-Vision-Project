const Admin = require("../models/Admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../services/sendEmail");

// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    if (admin.isDisabled) {
      return res.status(403).json({
        message: "Your account is disabled. Please contact support.",
        isDisabled: true,
      });
    }

    if (!admin.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      admin.otp = otp;
      admin.otpExpiry = Date.now() + 5 * 60 * 1000;
      await admin.save();

      // ✅ Send the email
      await sendEmail(
        admin.email,
        "Staff Email Verification",
        `Your OTP code is: ${otp}`
      );

      return res.status(403).json({
        message: "Email not verified. OTP sent.",
        requiresVerification: true,
        email: admin.email,
        staffId: admin._id,
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE STAFF (Super Admin only)
exports.createStaff = async (req, res) => {
  const { username, email, password, permissions } = req.body;

  try {
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing)
      return res.status(400).json({ message: "Staff already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Admin({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      permissions: permissions || [],
    });

    await staff.save();
    res
      .status(201)
      .json({ message: "Staff account created", staffId: staff._id });
  } catch (err) {
    console.error("Create staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL STAFF (Super Admin only)
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Admin.find({ role: "admin" }).select("-password");
    res.status(200).json(staff);
  } catch (err) {
    console.error("Get all staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE STAFF PERMISSIONS (Super Admin only)
exports.updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  try {
    const staff = await Admin.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.permissions = permissions;
    await staff.save();

    res.status(200).json({ message: "Permissions updated" });
  } catch (err) {
    console.error("Update permissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyStaffOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (!admin.otp || admin.otp !== otp || Date.now() > admin.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "fallback",
      {
        expiresIn: "1h",
      }
    );

    return res
      .status(200)
      .json({ message: "Email verified. Logged in.", token, role: admin.role });
  } catch (err) {
    console.error("OTP verification failed:", err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

//resend otp
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 5 * 60 * 1000;
    await admin.save();

    await sendEmail(admin.email, "Verification OTP", `Your new OTP is: ${otp}`);
    res.status(200).json({ message: "OTP resent to email" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// DISABLE USER
exports.disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDisabled = true;
    await user.save();
    res.status(200).json({ message: "User disabled" });
  } catch (err) {
    console.error("Disable user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ENABLE USER
exports.enableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isDisabled = false;
    await user.save();
    res.status(200).json({ message: "User enabled" });
  } catch (err) {
    console.error("Enable user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DISABLE STAFF
exports.disableStaff = async (req, res) => {
  try {
    const staff = await Admin.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.isDisabled = true;
    await staff.save();
    res.status(200).json({ message: "Staff disabled" });
  } catch (err) {
    console.error("Disable staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ENABLE STAFF
exports.enableStaff = async (req, res) => {
  try {
    const staff = await Admin.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.isDisabled = false;
    await staff.save();
    res.status(200).json({ message: "Staff enabled" });
  } catch (err) {
    console.error("Enable staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Admin.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json({ message: "Staff deleted" });
  } catch (err) {
    console.error("Delete staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
