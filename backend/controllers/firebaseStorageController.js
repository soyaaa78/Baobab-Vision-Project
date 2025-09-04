const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");

const firebaseConfig = {
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
};

// Initialize Firebase
initializeApp(firebaseConfig);
const storage = getStorage();

// Helper function to determine content type based on file extension
const getContentType = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  const contentTypes = {
    glb: "model/gltf-binary",
    gltf: "model/gltf+json",
    usd: "model/vnd.usd",
    usdc: "model/vnd.usdc",
    usdz: "model/vnd.usdz+zip",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return contentTypes[ext] || "application/octet-stream";
};

// Multer configuration for memory storage (for Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for 3D models
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "model3d" || file.fieldname === "colorwayModels3d") {
      // Allow 3D model files
      const allowedTypes = /usd|usdc|usdz|glb|gltf/;
      const extname = allowedTypes.test(
        file.originalname.toLowerCase().split(".").pop()
      );
      if (extname) {
        return cb(null, true);
      } else {
        cb(
          new AppError(
            "Only USD, USDC, USDZ, GLB, and GLTF files are allowed for 3D models",
            400
          )
        );
      }
    } else {
      // Allow image files for product and colorway images (including HEIC/HEIF from iOS)
      const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
      const ext = (file.originalname || "").toLowerCase().split(".").pop();
      const hasAllowedExt = allowedTypes.test(ext || "");
      const hasImageMime = !!file.mimetype && /image\//.test(file.mimetype);

      if (hasAllowedExt || hasImageMime) {
        return cb(null, true);
      }
      cb(new AppError("Only image files are allowed", 400));
    }
  },
});

// Middleware for handling multiple file fields
exports.uploadProductFiles = upload.fields([
  { name: "productImages", maxCount: 10 },
  { name: "colorwayImages", maxCount: 10 },
  { name: "model3d", maxCount: 1 }, // main/default 3D model
  { name: "colorwayModels3d", maxCount: 10 }, // per-colorway 3D models (aligned with colorwayImages index)
]);

// Middleware for proof of payment pictures (images only)
exports.uploadProofOfPaymentFiles = upload.single("proofOfPayment");

// Middleware for rating pictures (images only)
exports.uploadRatingPicturesFiles = upload.array("ratingPictures", 10);

// Middleware for 3D models only (single or multiple per-colorway)
exports.upload3dFields = upload.fields([
  { name: "model3d", maxCount: 1 },
  { name: "colorwayModels3d", maxCount: 10 },
]);

// Upload single image
const uploadSingleImage = async (file, folder, customName = null) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileName = customName || `${uniqueSuffix}-${file.originalname}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  const metadata = {
    contentType: file.mimetype || getContentType(file.originalname),
  };

  const snapshot = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metadata
  );

  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Upload multiple images
const uploadMultipleImages = async (files, folder) => {
  const uploadPromises = files.map((file) => uploadSingleImage(file, folder));
  return await Promise.all(uploadPromises);
};

// Upload product images
exports.uploadProductImages = catchAsync(async (req, res, next) => {
  if (
    !req.files ||
    (!req.files.productImages &&
      !req.files.colorwayImages &&
      !req.files.model3d)
  ) {
    return next(new AppError("No files uploaded", 400));
  }

  const uploadResults = {};

  try {
    // Upload product images
    if (req.files.productImages) {
      uploadResults.productImageUrls = await uploadMultipleImages(
        req.files.productImages,
        "products/images"
      );
    }

    // Upload colorway images
    if (req.files.colorwayImages) {
      uploadResults.colorwayImageUrls = await uploadMultipleImages(
        req.files.colorwayImages,
        "products/colorways"
      );
    }

    // Upload 3D model
    if (req.files.model3d) {
      uploadResults.model3dUrl = await uploadSingleImage(
        req.files.model3d[0],
        "products/models"
      );
    }

    res.status(200).json({
      message: "Files uploaded successfully!",
      ...uploadResults,
    });
  } catch (error) {
    console.error("Firebase upload error:", error);
    return next(new AppError("Failed to upload files to storage", 500));
  }
});

// Upload proof of payment image (single)
exports.uploadProofOfPaymentImages = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  try {
    const url = await uploadSingleImage(req.file, "payments/proofs");
    res
      .status(200)
      .json({ message: "Proof of payment uploaded successfully!", url });
  } catch (error) {
    console.error("Firebase upload error (proof of payment):", error);
    return next(new AppError("Failed to upload proof of payment files", 500));
  }
});

// Upload rating pictures
exports.uploadRatingPictures = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No files uploaded", 400));
  }

  try {
    const urls = await uploadMultipleImages(req.files, "ratings/pictures");
    res
      .status(200)
      .json({ message: "Rating pictures uploaded successfully!", urls });
  } catch (error) {
    console.error("Firebase upload error (rating pictures):", error);
    return next(new AppError("Failed to upload rating pictures", 500));
  }
});

// Upload 3D models (single or multiple) and return URLs
exports.upload3dModels = catchAsync(async (req, res, next) => {
  if (!req.files || (!req.files.model3d && !req.files.colorwayModels3d)) {
    return next(new AppError("No 3D model files uploaded", 400));
  }

  try {
    const result = {};
    if (req.files.model3d && req.files.model3d[0]) {
      result.model3dUrl = await uploadSingleImage(
        req.files.model3d[0],
        "products/models"
      );
    }
    if (req.files.colorwayModels3d && req.files.colorwayModels3d.length > 0) {
      result.colorwayModelUrls = await uploadMultipleImages(
        req.files.colorwayModels3d,
        "products/models"
      );
    }
    return res.status(200).json({
      message: "3D models uploaded successfully!",
      ...result,
    });
  } catch (error) {
    console.error("Firebase 3D upload error:", error);
    return next(new AppError("Failed to upload 3D models", 500));
  }
});

// Delete image from Firebase Storage
exports.deleteImage = catchAsync(async (req, res, next) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return next(new AppError("Image URL is required", 400));
  }

  try {
    // Extract the file path from the download URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf("/o/") + 3;
    const endIndex = decodedUrl.indexOf("?");
    const filePath = decodedUrl.substring(startIndex, endIndex);

    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);

    res.status(200).json({
      message: "Image deleted successfully!",
    });
  } catch (error) {
    console.error("Firebase delete error:", error);
    return next(new AppError("Failed to delete image", 500));
  }
});

// Export helper functions for use in other controllers
exports.uploadSingleImageHelper = uploadSingleImage;
exports.uploadMultipleImagesHelper = uploadMultipleImages;
