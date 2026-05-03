const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");
const { verifyToken: authenticateAdmin } = require("../middlewares/adminAuthMiddleware");
const {
  uploadProductImages,
  deleteImage,
  uploadProofOfPaymentImages,
  uploadRatingPictures,
  uploadProofOfPaymentFiles,
  uploadRatingPicturesFiles,
  upload3dFields,
  upload3dModels,
  serveR2Asset,
} = require("../controllers/storageController");

// Public R2 asset proxy. Useful when client networks cannot resolve r2.dev.
router.get("/assets/*", serveR2Asset);

// Upload product images (POST /api/storage/upload)
router.post("/upload", authenticateAdmin, uploadProductImages);

// Upload proof of payment pictures
router.post(
  "/upload/proof-of-payment",
  authenticateUser,
  uploadProofOfPaymentFiles,
  uploadProofOfPaymentImages
);

// Upload rating pictures
router.post(
  "/upload/rating-pictures",
  authenticateUser,
  uploadRatingPicturesFiles,
  uploadRatingPictures
);

// Upload 3D model files (single main or per-colorway) and return URLs
router.post("/upload/models", authenticateAdmin, upload3dFields, upload3dModels);

// Delete image (DELETE /api/storage/delete)
router.delete("/delete", authenticateAdmin, deleteImage);

module.exports = router;
