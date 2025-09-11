const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadImage,
  getAllImages,
  deleteImage,
} = require("../controllers/slideShowController");

const router = express.Router();

// Use memory storage for Firebase uploads
const upload = multer({ storage: multer.memoryStorage() });

// POST new image upload
router.post("/upload-image", upload.single("image"), uploadImage);

// GET all images
router.get("/all-images", getAllImages);

// DELETE image
router.delete("/:id", deleteImage);

// (Reorder removed)

module.exports = router;
