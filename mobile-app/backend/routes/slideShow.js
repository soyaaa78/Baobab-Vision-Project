const express = require('express');
const multer = require('multer');
const path = require('path');
const SlideshowImage = require('../models/SlideshowImage');

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
router.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  try {
    const newImage = new SlideshowImage({ imagePath: req.file.path });
    await newImage.save();
    res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image', error });
  }
});

// GET all images
router.get('/all-images', async (req, res) => {
  try {
    const images = await SlideshowImage.find().sort({ createdAt: -1 });
    res.json(images.map(img => `http://10.0.2.2:3001/${img.imagePath}`));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images', error });
  }
});

module.exports = router;
