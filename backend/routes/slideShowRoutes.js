const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage, getAllImages } = require('../controllers/slideShowController');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST new image upload
router.post('/upload-image', upload.single('image'), uploadImage);

// GET all images
router.get('/all-images', getAllImages);

module.exports = router;
