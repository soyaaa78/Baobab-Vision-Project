const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getRecommendedProducts,
  addProductToRecommended,
  updateProduct,
  deleteProduct,
  getFaceShapeStats,
  getProductStatistics,
  getTopRatedThisMonth,
  getStatisticsDashboard,
  recommendEyewear,
  trackProductView,
  uploadProductFiles,
  getProductReviews,
  getProductsWith3DModels,
} = require("../controllers/productController");

// Create product (POST /api/products) - with file upload
router.post("/", uploadProductFiles, createProduct);

// GET all products (GET /api/products)
router.get("/", getAllProducts);

// GET recommended products for "Recommended for You" section (GET /api/products/for-you)
router.get("/for-you", getRecommendedProducts);

// GET products with 3D models (GET /api/products/models)
router.get("/models", getProductsWith3DModels);

// Admin adds product to recommended (POST /api/products/recommended)
router.post("/recommended", addProductToRecommended);

// Add recommendation endpoint
router.post("/recommend", recommendEyewear);

// Add face shape statistics endpoint
router.get("/face-shape-stats", getFaceShapeStats);

router.get("/order-stats", getProductStatistics);
router.get("/top-rated-this-month", getTopRatedThisMonth);
router.get("/statistics-dashboard", getStatisticsDashboard);
router.post("/:id/view", trackProductView);

// Reviews + rating stats for a product
router.get("/:id/reviews", getProductReviews);

router.put("/", uploadProductFiles, updateProduct);

router.delete("/", deleteProduct);

module.exports = router;
