const SlideshowImage = require('../models/SlideshowImage');
const path = require('path');

// POST new image upload
const uploadImage = async (req, res) => {
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
};

// GET all images
const getAllImages = async (req, res) => {
  try {
    const images = await SlideshowImage.find().sort({ createdAt: -1 });
    res.json(images.map(img => `http://10.0.2.2:3001/${img.imagePath}`));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images', error });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
};
