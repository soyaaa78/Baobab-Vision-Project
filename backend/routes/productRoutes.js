// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getRecommendedProducts,
  addProductToRecommended,
  updateProduct,
  deleteProduct,
  recommendEyewear,
  getFaceShapeStats,
  recommendEyewear, // <-- add this
} = require("../controllers/productController");

// Create product (POST /api/products)
router.post("/", createProduct);

// GET all products (GET /api/products)
router.get("/", getAllProducts);

// GET recommended products for "Recommended for You" section (GET /api/products/for-you)
router.get("/for-you", getRecommendedProducts);

// Admin adds product to recommended (POST /api/products/recommended)
router.post("/recommended", addProductToRecommended);

// Add recommendation endpoint
router.post("/recommend", recommendEyewear);

// Add face shape statistics endpoint
router.get("/face-shape-stats", getFaceShapeStats);

router.post("/recommend", recommendEyewear);

router.put("/", updateProduct);

router.delete("/", deleteProduct);

module.exports = router;
