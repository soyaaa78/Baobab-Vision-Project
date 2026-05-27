const express = require("express");
const router = express.Router();
const { list } = require("../controllers/auditLogController");
const adminAuth = require("../middlewares/adminAuthMiddleware");

const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(403)
      .json({ message: "Access denied. System Admin only." });
  }
  next();
};

// View logs (System Admin only)
router.get("/", adminAuth.verifyToken, isSuperAdmin, list);

module.exports = router;
