// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  requestOtp,
  verifyOtp,
  resendOtp,
  resetPassword
} = require('../controllers/authController');

// REGISTER
router.post('/register', register);

// LOGIN
router.post('/login', login);

// VERIFY EMAIL OTP
router.post('/verify-email-otp', verifyEmailOtp);

// RESEND EMAIL OTP
router.post('/resend-email-otp', resendEmailOtp);

// PASSWORD RESET: REQUEST OTP
router.post('/request-otp', requestOtp);

// PASSWORD RESET: VERIFY OTP
router.post('/verify-otp', verifyOtp);

// PASSWORD RESET: RESEND OTP
router.post('/resend-otp', resendOtp);

// PASSWORD RESET: UPDATE PASSWORD
router.post('/reset-password', resetPassword);

module.exports = router;
