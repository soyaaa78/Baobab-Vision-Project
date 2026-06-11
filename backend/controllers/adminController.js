const Admin = require("../models/Admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../services/sendEmail");
const { logEvent } = require("../services/auditLogService");
const crypto = require("crypto");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_TOKEN_EXPIRY = "10m";
const STAFF_VERIFICATION_OTP_PURPOSE = "staff_verification";
const PASSWORD_RESET_OTP_PURPOSE = "password_reset";
const GENERIC_RESET_REQUEST_MESSAGE =
  "If an admin account exists for that email, a reset code has been sent.";
const INVALID_OTP_MESSAGE = "Invalid or expired OTP";
const INVALID_RESET_TOKEN_MESSAGE = "Invalid or expired reset token";
const PASSWORD_POLICY_MESSAGE =
  "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)";

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const getNonEmptyRequestString = (value) =>
  typeof value === "string" && value.trim() !== "" ? value : null;

const isValidAdminPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  password.length <= 32 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*]/.test(password);

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
      // Only update OTP fields, not the whole document
      const otp = generateOtp();
      admin.otp = otp;
      admin.otpExpiry = Date.now() + 5 * 60 * 1000;
      admin.otpPurpose = STAFF_VERIFICATION_OTP_PURPOSE;
      await Admin.updateOne(
        { _id: admin._id },
        {
          $set: {
            otp: admin.otp,
            otpExpiry: admin.otpExpiry,
            otpPurpose: admin.otpPurpose,
          },
        }
      );

      await sendEmail(
        admin.email,
        "Staff Email Verification",
        `Your OTP code is: ${otp}`
      );

      // Audit: OTP sent for verification
      logEvent(req, {
        eventType: "auth",
        action: "Staff login verification OTP sent",
        targetModel: "Admin",
        targetId: admin._id,
        metadata: { email: admin.email },
      });

      return res.status(403).json({
        message: "Email not verified. OTP sent.",
        requiresVerification: true,
        email: admin.email,
        staffId: admin._id,
      });
    }

    const jti = crypto.randomUUID();
    const tokenPayload = { id: admin._id, role: admin.role, jti };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "fallback", {
      expiresIn: "1h",
    });
    // Ensure actor context exists for audit log
    req.user = { id: admin._id, role: admin.role, jti };

    // Audit: staff login
    logEvent(req, {
      eventType: "auth",
      action: `Staff logged in (${username})`,
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { username },
    });

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

// ADMIN PASSWORD RESET: REQUEST OTP
exports.requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body || {};
  const requestEmail = getNonEmptyRequestString(email);

  try {
    if (!requestEmail) {
      return res.status(200).json({ message: GENERIC_RESET_REQUEST_MESSAGE });
    }

    const admin = await Admin.findOne({ email: requestEmail });
    if (!admin || admin.isDisabled) {
      return res.status(200).json({ message: GENERIC_RESET_REQUEST_MESSAGE });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: {
          otp,
          otpExpiry,
          otpPurpose: PASSWORD_RESET_OTP_PURPOSE,
          resetPasswordNonce: null,
        },
      }
    );

    try {
      await sendEmail(
        admin.email,
        "Admin Password Reset OTP",
        `Your admin password reset OTP is: ${otp}. This code is valid for 5 minutes.`
      );
    } catch (err) {
      console.error("Admin password reset OTP email error:", err);
      await Admin.updateOne(
        {
          _id: admin._id,
          otp,
          otpExpiry,
          otpPurpose: PASSWORD_RESET_OTP_PURPOSE,
          resetPasswordNonce: null,
        },
        {
          $set: {
            otp: null,
            otpExpiry: null,
            otpPurpose: null,
            resetPasswordNonce: null,
          },
        }
      );
      return res.status(200).json({ message: GENERIC_RESET_REQUEST_MESSAGE });
    }

    logEvent(req, {
      eventType: "auth",
      action: "Admin password reset OTP sent",
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { email: admin.email },
      forceSystem: true,
    });

    return res.status(200).json({ message: GENERIC_RESET_REQUEST_MESSAGE });
  } catch (err) {
    console.error("Admin password reset OTP request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ADMIN PASSWORD RESET: VERIFY OTP
exports.verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body || {};
  const requestEmail = getNonEmptyRequestString(email);
  const requestOtp = getNonEmptyRequestString(otp);

  try {
    if (!requestEmail || !requestOtp) {
      return res.status(400).json({ message: INVALID_OTP_MESSAGE });
    }

    const admin = await Admin.findOne({ email: requestEmail });
    const otpExpiryTime = new Date(admin?.otpExpiry).getTime();
    if (
      !admin ||
      admin.isDisabled ||
      !admin.otp ||
      !admin.otpExpiry ||
      admin.otpPurpose !== PASSWORD_RESET_OTP_PURPOSE ||
      admin.otp !== requestOtp ||
      !Number.isFinite(otpExpiryTime) ||
      Date.now() > otpExpiryTime
    ) {
      return res.status(400).json({ message: INVALID_OTP_MESSAGE });
    }

    const resetPasswordNonce = crypto.randomUUID();
    const updateResult = await Admin.updateOne(
      {
        _id: admin._id,
        isDisabled: { $ne: true },
        otp: requestOtp,
        otpPurpose: PASSWORD_RESET_OTP_PURPOSE,
        otpExpiry: { $eq: admin.otpExpiry, $gt: new Date() },
      },
      { $set: { resetPasswordNonce } }
    );
    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({ message: INVALID_OTP_MESSAGE });
    }

    const resetToken = jwt.sign(
      { id: admin._id, otpExpiry: otpExpiryTime, resetPasswordNonce },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: RESET_TOKEN_EXPIRY }
    );

    logEvent(req, {
      eventType: "auth",
      action: "Admin password reset OTP verified",
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { email: admin.email },
      forceSystem: true,
    });

    return res.status(200).json({ message: "OTP verified", resetToken });
  } catch (err) {
    console.error("Admin password reset OTP verification error:", err);
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

// ADMIN PASSWORD RESET: UPDATE PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body || {};

  try {
    if (!token) {
      return res.status(400).json({ message: INVALID_RESET_TOKEN_MESSAGE });
    }

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const resetStateExpiryTime = Number(decoded?.otpExpiry);
    const resetPasswordNonce = decoded?.resetPasswordNonce;
    if (
      !decoded?.id ||
      !Number.isFinite(resetStateExpiryTime) ||
      typeof resetPasswordNonce !== "string" ||
      resetPasswordNonce.length === 0
    ) {
      return res.status(400).json({ message: INVALID_RESET_TOKEN_MESSAGE });
    }

    const resetStateExpiry = new Date(resetStateExpiryTime);
    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.isDisabled) {
      return res.status(400).json({ message: INVALID_RESET_TOKEN_MESSAGE });
    }

    if (!isValidAdminPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_POLICY_MESSAGE });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateResult = await Admin.updateOne(
      {
        _id: admin._id,
        isDisabled: { $ne: true },
        otp: { $exists: true, $ne: null },
        otpPurpose: PASSWORD_RESET_OTP_PURPOSE,
        otpExpiry: { $eq: resetStateExpiry },
        resetPasswordNonce,
      },
      {
        $set: {
          password: hashedPassword,
          otp: null,
          otpExpiry: null,
          otpPurpose: null,
          resetPasswordNonce: null,
          isVerified: true,
        },
      }
    );
    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({ message: INVALID_RESET_TOKEN_MESSAGE });
    }

    logEvent(req, {
      eventType: "auth",
      action: "Admin password reset completed",
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { email: admin.email },
      forceSystem: true,
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Admin reset password error:", err);
    return res.status(400).json({ message: INVALID_RESET_TOKEN_MESSAGE });
  }
};

// CREATE STAFF (System Admin only)
exports.createStaff = async (req, res) => {
  const { firstname, lastname, username, email, password, permissions, role } =
    req.body;

  // Only allow creation of staff_product or staff_order roles
  if (!role || !["staff_product", "staff_order"].includes(role)) {
    return res.status(400).json({ message: "Invalid staff role" });
  }

  try {
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing)
      return res.status(400).json({ message: "Staff already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Admin({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      role,
      permissions: permissions || [],
    });

    await staff.save();

    // Audit: add staff account
    logEvent(req, {
      eventType: "staff",
      action: `Created staff account (${username})`,
      targetModel: "Admin",
      targetId: staff._id,
      newValues: { firstname, lastname, username, email, role, permissions },
    });

    await sendEmail(
      staff.email,
      "Baobab Vision - Staff Account Created",
      "Your staff account has been created. Please sign in to verify your email."
    );

    res.status(201).json({
      message: "Staff account created and verification email sent",
      staffId: staff._id,
    });
  } catch (err) {
    console.error("Create staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL STAFF (System Admin only)
exports.getAllStaff = async (req, res) => {
  try {
    // Get all staff_product and staff_order roles
    const staff = await Admin.find({
      role: { $in: ["staff_product", "staff_order"] },
    }).select("-password");
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

// UPDATE STAFF PERMISSIONS (System Admin only)
exports.updatePermissions = async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  try {
    const staff = await Admin.findById(id);
    if (!staff || !["staff_product", "staff_order"].includes(staff.role)) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.permissions = permissions;
    await staff.save();

    // Audit: update staff permissions
    logEvent(req, {
      eventType: "staff",
      action: `Updated staff permissions (${staff.username})`,
      targetModel: "Admin",
      targetId: staff._id,
      newValues: { permissions },
    });

    res.status(200).json({ message: "Permissions updated" });
  } catch (err) {
    console.error("Update permissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyStaffOtp = async (req, res) => {
  const { email, otp } = req.body || {};
  const requestEmail = getNonEmptyRequestString(email);
  const requestOtp = getNonEmptyRequestString(otp);
  try {
    if (!requestEmail || !requestOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const admin = await Admin.findOne({ email: requestEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.isDisabled) {
      return res.status(403).json({
        message: "Your account is disabled. Please contact support.",
        isDisabled: true,
      });
    }

    const otpExpiryTime = new Date(admin.otpExpiry).getTime();
    const hasStaffVerificationPurpose =
      admin.otpPurpose === STAFF_VERIFICATION_OTP_PURPOSE ||
      (admin.otpPurpose == null && !admin.isVerified);

    if (
      admin.isVerified ||
      !admin.otp ||
      !hasStaffVerificationPurpose ||
      admin.otp !== requestOtp ||
      !Number.isFinite(otpExpiryTime) ||
      Date.now() > otpExpiryTime
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const allowedPurposeFilter =
      admin.otpPurpose === STAFF_VERIFICATION_OTP_PURPOSE
        ? { otpPurpose: STAFF_VERIFICATION_OTP_PURPOSE }
        : { otpPurpose: null };

    // Only update relevant fields, do not save incomplete document
    const updateResult = await Admin.updateOne(
      {
        _id: admin._id,
        isDisabled: { $ne: true },
        isVerified: false,
        otp: requestOtp,
        otpExpiry: { $eq: new Date(otpExpiryTime), $gt: new Date() },
        $or: [allowedPurposeFilter],
      },
      {
        $set: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          otpPurpose: null,
        },
      }
    );
    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const jti = crypto.randomUUID();
    const tokenPayload = { id: admin._id, role: admin.role, jti };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "fallback", {
      expiresIn: "1h",
    });
    // Ensure actor context exists for audit log
    req.user = { id: admin._id, role: admin.role, jti };

    // Audit: staff verification
    logEvent(req, {
      eventType: "auth",
      action: `Staff email verified (${requestEmail})`,
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { email: requestEmail },
    });

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
  const { email } = req.body || {};
  const requestEmail = getNonEmptyRequestString(email);
  try {
    if (!requestEmail) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const admin = await Admin.findOne({ email: requestEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = generateOtp();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 5 * 60 * 1000;
    admin.otpPurpose = STAFF_VERIFICATION_OTP_PURPOSE;
    await admin.save();

    await sendEmail(admin.email, "Verification OTP", `Your new OTP is: ${otp}`);
    // Audit: resend otp
    logEvent(req, {
      eventType: "auth",
      action: "Staff verification OTP resent",
      targetModel: "Admin",
      targetId: admin._id,
      metadata: { email: requestEmail },
    });
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
    // Audit: disable user
    logEvent(req, {
      eventType: "user",
      action: `Disabled user account (${
        user.username || user.email || user._id
      })`,
      targetModel: "User",
      targetId: user._id,
    });
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
    // Audit: enable user
    logEvent(req, {
      eventType: "user",
      action: `Enabled user account (${
        user.username || user.email || user._id
      })`,
      targetModel: "User",
      targetId: user._id,
    });
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
    // Audit: delete user
    logEvent(req, {
      eventType: "user",
      action: `Deleted user account (${
        user?.username || user?.email || req.params.id
      })`,
      targetModel: "User",
      targetId: req.params.id,
    });
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
    if (!staff || !["staff_product", "staff_order"].includes(staff.role)) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await Admin.findByIdAndUpdate(
      req.params.id,
      { isDisabled: true },
      { runValidators: false }
    );
    // Audit: disable staff
    logEvent(req, {
      eventType: "staff",
      action: `Disabled staff account (${staff.username})`,
      targetModel: "Admin",
      targetId: req.params.id,
    });
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
    if (!staff || !["staff_product", "staff_order"].includes(staff.role)) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await Admin.findByIdAndUpdate(
      req.params.id,
      { isDisabled: false },
      { runValidators: false }
    );
    // Audit: enable staff
    logEvent(req, {
      eventType: "staff",
      action: `Enabled staff account (${staff.username})`,
      targetModel: "Admin",
      targetId: req.params.id,
    });
    res.status(200).json({ message: "Staff enabled" });
  } catch (err) {
    console.error("Enable staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Admin.findById(req.params.id);
    if (!staff || !["staff_product", "staff_order"].includes(staff.role)) {
      return res.status(404).json({ message: "Staff not found" });
    }
    await Admin.findByIdAndDelete(req.params.id);
    // Audit: delete staff
    logEvent(req, {
      eventType: "staff",
      action: `Deleted staff account (${staff.username})`,
      targetModel: "Admin",
      targetId: req.params.id,
    });
    res.status(200).json({ message: "Staff deleted" });
  } catch (err) {
    console.error("Delete staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET STAFF PROFILE
exports.getStaffProfile = async (req, res) => {
  try {
    const staff = await Admin.findById(req.user.id).select(
      "-password -otp -otpExpiry"
    );
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json(staff);
  } catch (err) {
    console.error("Get staff profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHANGE STAFF PASSWORD
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const staff = await Admin.findById(req.user.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (!isValidAdminPassword(newPassword)) {
      return res.status(400).json({ message: PASSWORD_POLICY_MESSAGE });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await Admin.findByIdAndUpdate(
      req.user.id,
      { password: hashedNewPassword },
      { runValidators: false }
    );

    res.status(200).json({ message: "Password changed successfully" });
    // Audit: staff changed password (no sensitive values)
    logEvent(req, {
      eventType: "admin",
      action: "Changed account password",
      targetModel: "Admin",
      targetId: req.user.id,
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT (invalidate on client; we record the event server-side)
exports.logout = async (req, res) => {
  try {
    // Resolve username for clearer audit message
    let username = undefined;
    if (req.user?.id) {
      try {
        const staffDoc = await Admin.findById(req.user.id).select(
          "username email"
        );
        if (staffDoc) {
          username =
            staffDoc.username || staffDoc.email || staffDoc._id?.toString();
        }
      } catch (_) {}
    }

    // Audit: staff logout
    logEvent(req, {
      eventType: "auth",
      action: `Staff logged out${username ? ` (${username})` : ""}`,
      targetModel: "Admin",
      targetId: req.user?.id,
      metadata: username ? { username } : undefined,
    });
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Admin logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
