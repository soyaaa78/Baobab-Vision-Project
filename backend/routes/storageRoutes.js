const express = require("express");
const router = express.Router();
const {
  uploadProductImages,
  deleteImage,
  uploadProofOfPaymentImages,
  uploadRatingPictures,
  uploadProofOfPaymentFiles,
  uploadRatingPicturesFiles,
  upload3dFields,
  upload3dModels,
} = require("../controllers/firebaseStorageController");

// Upload product images (POST /api/storage/upload)
router.post("/upload", uploadProductImages);

// Upload proof of payment pictures
router.post(
  "/upload/proof-of-payment",
  uploadProofOfPaymentFiles,
  uploadProofOfPaymentImages
);

// Upload rating pictures
router.post(
  "/upload/rating-pictures",
  uploadRatingPicturesFiles,
  uploadRatingPictures
);

// Upload 3D model files (single main or per-colorway) and return URLs
router.post("/upload/models", upload3dFields, upload3dModels);

// Delete image (DELETE /api/storage/delete)
router.delete("/delete", deleteImage);

module.exports = router;
