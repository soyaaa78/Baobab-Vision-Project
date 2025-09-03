const express = require("express");
const router = express.Router();
const { list } = require("../controllers/auditLogController");
const adminAuth = require("../middlewares/adminAuthMiddleware");

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "super_admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Super admin only." });
  }
  next();
};

// View logs (Super Admin only)
router.get("/", adminAuth.verifyToken, isSuperAdmin, list);

module.exports = router;
