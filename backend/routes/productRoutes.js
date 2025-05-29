// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getRecommendedProducts,
  addProductToRecommended,
  updateProduct,
} = require("../controllers/productController");

// Create product (POST /api/products)
router.post("/", createProduct);

// GET all products (GET /api/products)
router.get("/", getAllProducts);

// GET recommended products for "Recommended for You" section (GET /api/products/for-you)
router.get("/for-you", getRecommendedProducts);

// Admin adds product to recommended (POST /api/products/recommended)
router.post("/recommended", addProductToRecommended);

router.put("/", updateProduct);

module.exports = router;
