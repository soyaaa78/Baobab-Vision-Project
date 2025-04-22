require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const sendEmail = require('../services/sendEmail');

//REGISTER
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, username, password } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: 'Email already used' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstname, lastname, email, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Please log in to verify your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check password first
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if email is verified
    // Check if email is verified
if (!user.isVerified) {
  const verificationToken = jwt.sign({ id: user._id }, process.env.EMAIL_SECRET_KEY, { expiresIn: '5m' });

  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_URL
    : 'http://localhost:3001';

  const verificationLink = `${baseUrl}/auth/verify-silent?token=${verificationToken}`;

  const emailHtml = `
    <div style="font-family: Arial; line-height: 1.6;">
      <h2>Email Verification</h2>
      <p>Tap the button below to verify your email.</p>
      <a href="${verificationLink}">
        <button style="padding: 10px 20px; background-color: #28a745; color: white;">
          Verify Email
        </button>
      </a>
      <p>After clicking, return to the app. The status will update automatically.</p>
    </div>
  `;

  try {
    await sendEmail(user.email, 'Verify your email', verificationLink, emailHtml);
  } catch (err) {
    console.error('Verification email failed:', err);
  }

  const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({
    message: 'Login successful. Verification email sent.',
    token: authToken,
    email: user.email,
    isVerified: false,
    verificationToken // 👈 send this to frontend
  });
}    
    // All good: email verified + correct password → Login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      message: 'Login successful',
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// VERIFY EMAIL (Updated for auto-login)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    // Verify the token
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).send('Invalid token or user not found');
    }

    if (user.isVerified) {
      return res.send(`
        <html>
          <body style="font-family: Arial; text-align: center; margin-top: 50px;">
            <h1>✅ Email Already Verified</h1>
            <p>You can now return to the app and tap "I've Verified".</p>
          </body>
        </html>
      `);
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    // ✅ Respond with a browser-friendly message
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; margin-top: 50px;">
          <h1>✅ Email Verified Successfully</h1>
          <p>You can now return to the app and tap "I've Verified".</p>
        </body>
      </html>
    `);

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).send('Token expired. Please request a new verification email.');
    }

    console.error('Error during email verification:', err);
    res.status(500).send('Invalid or expired token');
  }
});

// RESEND VERIFICATION EMAIL
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const token = jwt.sign({ id: user._id }, process.env.EMAIL_SECRET_KEY, { expiresIn: '5m' });

    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.PRODUCTION_URL
      : 'http://localhost:3001';

    const verificationLink = `${baseUrl}/auth/verify-silent?token=${token}`;

    const emailHtml = `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Tap the button below to verify your email:</p>
        <a href="${verificationLink}">
          <button style="padding: 10px 20px; background-color: #28a745; color: white;">
            Verify Email
          </button>
        </a>
        <p>This link will expire in 5 minutes.</p>
      </div>
    `;

    try {
      await sendEmail(
        user.email,
        'Verify your email',
        `Click this link to verify: ${verificationLink}`,
        emailHtml
      );
    } catch (err) {
      return res.status(500).json({ message: 'Error sending verification email. Please try again later.' });
    }

    res.status(200).json({ message: 'Verification email sent again.', token });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// CHECK EMAIL VERIFICATION STATUS
router.post('/check-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json({ verified: user.isVerified });
});


router.get('/verify-silent', async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).send();

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.status(204).send(); // ✅ No browser content
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('Token expired');
      return res.status(400).send(); // ✅ Just fail silently
    }

    res.status(400).send(); // Invalid or malformed token
  }
});

router.post('/check-verification-token', async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.EMAIL_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ verified: user.isVerified });

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ expired: true, message: 'Token expired' });
    }

    res.status(400).json({ message: 'Invalid token' });
  }
});


module.exports = router;