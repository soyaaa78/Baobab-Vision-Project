const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../controllers/userProfileController");
const authenticateUser = require("../middlewares/authMiddleware");
const multer = require("multer");
// Use memory storage for R2 uploads.
const upload = multer({ storage: multer.memoryStorage() });

// GET user profile
router.get("/profile", authenticateUser, getProfile);

// PUT update profile with optional profileImage upload
router.put(
  "/profile",
  authenticateUser,
  upload.single("profileImage"),
  updateProfile
);

module.exports = router;
