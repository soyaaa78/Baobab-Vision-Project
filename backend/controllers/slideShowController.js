const SlideshowImage = require("../models/SlideshowImage");
const fs = require("fs");
const path = require("path");

// POST new image upload
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Normalize Windows backslashes to forward slashes for URLs
    const normalizedPath = req.file.path.replace(/\\/g, "/");
    // Compute next position (append to end)
    const last = await SlideshowImage.findOne().sort({ position: -1 });
    const nextPosition = last ? last.position + 1 : 1;
    const newImage = new SlideshowImage({
      imagePath: normalizedPath,
      position: nextPosition,
    });
    await newImage.save();
    res
      .status(201)
      .json({ message: "Image uploaded successfully", image: newImage });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image", error });
  }
};

// GET all images
const getAllImages = async (req, res) => {
  try {
    const images = await SlideshowImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images", error });
  }
};

// DELETE image by id (removes file and db record)
const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await SlideshowImage.findById(id);
    if (!doc) return res.status(404).json({ message: "Image not found" });

    // Attempt to delete file if exists
    if (doc.imagePath) {
      const filePath = path.resolve(process.cwd(), doc.imagePath);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.warn("Failed to delete image file:", err.message);
        }
      });
    }

    await SlideshowImage.deleteOne({ _id: id });
    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
  deleteImage,
};
