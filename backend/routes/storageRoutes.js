const express = require("express");
const router = express.Router();
const {
  uploadProductImages,
  deleteImage,
} = require("../controllers/firebaseStorageController");

// Upload product images (POST /api/storage/upload)
router.post("/upload", uploadProductImages);

// Delete image (DELETE /api/storage/delete)
router.delete("/delete", deleteImage);

module.exports = router;