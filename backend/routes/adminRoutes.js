const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middlewares/adminAuthMiddleware'); // NEW

// ✅ Checks if the logged-in admin is the super admin
const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied. Super admin only.' });
  }
  next();
};

// Routes
router.post('/login', adminController.login);
router.post('/create-staff', adminAuth.verifyToken, isSuperAdmin, adminController.createStaff);
router.get('/staff-list', adminAuth.verifyToken, isSuperAdmin, adminController.getAllStaff);
router.put('/permissions/:id', adminAuth.verifyToken, isSuperAdmin, adminController.updatePermissions);
router.post('/verify-otp', adminController.verifyStaffOtp);
router.post('/resend-otp', adminController.resendOtp);


module.exports = router;
