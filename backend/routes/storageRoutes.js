const express = require("express");
const router = express.Router();
const {
  uploadProductImages,
  deleteImage,
  uploadProofOfPaymentImages,
  uploadRatingPictures,
  uploadProofOfPaymentFiles,
  uploadRatingPicturesFiles,
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

// Delete image (DELETE /api/storage/delete)
router.delete("/delete", deleteImage);

module.exports = router;
