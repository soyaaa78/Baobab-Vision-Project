// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const sendEmail = require('../services/sendEmail');
const UserCart = require('../models/UserCart');

// REGISTER
const register = async (req, res) => {
  try {
    const { firstname, lastname, email, username, password } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: 'Email already used' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstname, lastname, email, username, password: hashedPassword });

    const savedUser = await newUser.save();

    const newUserPreferences = new UserPreferences({
      userId: savedUser._id,
      preferences: new Map(),
    });
    await newUserPreferences.save();

    res.status(201).json({
      userId: savedUser._id,
      username: savedUser.username,
      message: 'User registered successfully. Please log in to verify your email.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect Password' });

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = Date.now() + 5 * 60 * 1000;
      await user.save();

      await sendEmail(
        user.email, 
        'Email Verification OTP', 
        `
          Hi ${user.firstname},
      
          We have received a request to verify your email address for your account. To complete the verification process, please use the one-time password (OTP) provided below:
      
          OTP: ${otp}
      
          This OTP is valid for the next 5 minutes. If you did not request this verification, please disregard this message.
      
          If you have any questions or need further assistance, feel free to reach out to our support team.
      
          Best regards,
          The Baobab Vision Team
        `
      );
      

      return res.status(403).json({
        message: 'Email not verified. OTP sent.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback', {
      expiresIn: '1h',
    });

    let userCart = await UserCart.findOne({ userId: user._id });
    if (!userCart) {
      userCart = new UserCart({
        userId: user._id,
        items: [],
      });
      await userCart.save();
    }

    return res.status(200).json({
      message: 'Login successful',
      token,
      userId: user._id,
      cartId: userCart._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// VERIFY EMAIL OTP
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback', {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Email verified. Logged in.', token });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// RESEND EMAIL OTP
const resendEmailOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      'Your Verification OTP',
      `
        Hi ${user.firstname},
    
        We received a request to resend the OTP for your email verification. Please use the following one-time password (OTP) to complete your email verification process:
    
        OTP: ${otp}
    
        This OTP will expire in 5 minutes. If you did not request this, please disregard this message.
    
        Should you require any further assistance, feel free to contact our support team.
    
        Best regards,
        The Baobab Vision Team
      `
    );
    
    res.status(200).json({ message: 'OTP resent to email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

// PASSWORD RESET: REQUEST OTP
const requestOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    'Password Reset Request - OTP',
    `
      Hi ${user.firstname},
  
      We have received a request to reset your password for your account. To proceed, please use the one-time password (OTP) provided below:
  
      OTP: ${otp}
  
      This OTP is valid for the next 5 minutes. If you did not request a password reset, please disregard this message.
  
      If you need any help or have any questions, please do not hesitate to contact our support team.
  
      Best regards,
      The Baobab Vision Team
    `
  );
  
  
  res.status(200).json({ message: 'OTP sent to email' });
};

// PASSWORD RESET: VERIFY OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_SECRET, {
      expiresIn: '10m',
    });

    return res.status(200).json({ message: 'OTP verified', resetToken });
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// PASSWORD RESET: RESEND OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = newOtp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    'Your New OTP - Password Reset',
    `
      Hi ${user.firstname},
  
      We have received a request to resend your OTP for resetting your password. Please use the one-time password (OTP) provided below:
  
      OTP: ${newOtp}
  
      This OTP is valid for 5 minutes. If you did not request a password reset, please disregard this message.
  
      Should you require any assistance, please contact our support team.
  
      Best regards,
      The Baobab Vision Team
    `
  );
  
  res.status(200).json({ message: 'OTP resent' });
};

// PASSWORD RESET: UPDATE PASSWORD
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();
    console.log('✅ Password updated for:', user.email);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  login,
  verifyEmailOtp,
  resendEmailOtp,
  requestOtp,
  verifyOtp,
  resendOtp,
  resetPassword,
};
