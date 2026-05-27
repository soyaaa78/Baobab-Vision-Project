const express = require("express");
const multer = require("multer");
const { verifyToken: authenticateAdmin } = require("../middlewares/adminAuthMiddleware");
const {
  uploadImage,
  getAllImages,
  deleteImage,
} = require("../controllers/slideShowController");

const router = express.Router();

// Use memory storage for R2 uploads.
const upload = multer({ storage: multer.memoryStorage() });

// POST new image upload
router.post("/upload-image", authenticateAdmin, upload.single("image"), uploadImage);

// GET all images
router.get("/all-images", getAllImages);

// DELETE image
router.delete("/:id", authenticateAdmin, deleteImage);

// (Reorder removed)

module.exports = router;
