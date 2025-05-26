const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userProfileController');
const authenticateUser = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer storage to save files in 'uploads/' with timestamped filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'userprofileuploads/'); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// GET user profile
router.get('/profile', authenticateUser, getProfile);

// PUT update profile with optional profileImage upload
router.put('/profile', authenticateUser, upload.single('profileImage'), updateProfile);

module.exports = router;
