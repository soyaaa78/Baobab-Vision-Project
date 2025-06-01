// controllers/productController.js
const Product = require("../models/Products");
const RecommendationStat = require("../models/RecommendationStat");

// Create product
// Create product
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    imageUrls,
    specs,
    numStars,
    recommendedFor,
    sales,
    colorOptions,
    lensOptions, // ✅ include lensOptions in destructuring
  } = req.body;

  // Validate required fields
  if (!name || !description || !price || !specs) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const product = new Product({
      name,
      description,
      price,
      stock: stock || 0,
      imageUrls,
      specs,
      numStars: numStars || 5,
      recommendedFor: recommendedFor || false,
      sales: sales || 0,
      colorOptions: colorOptions || [],
      lensOptions: lensOptions || [],
    });

    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all products with optional sorting
exports.getAllProducts = async (req, res) => {
  const { id } = req.query;
  try {
    let products;
    if (id) {
      products = await Product.findById(id);
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get recommended products
exports.getRecommendedProducts = async (req, res) => {
  try {
    const recommendedProducts = await Product.find({
      recommendedFor: true, // Only fetch products where recommendedFor is true
    });

    if (recommendedProducts.length === 0) {
      return res.status(404).json({ message: "No recommended products found" });
    }

    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res
      .status(500)
      .json({ message: "Error fetching recommended products", error });
  }
};

// Admin adds product to recommended
exports.addProductToRecommended = async (req, res) => {
  const { productId, recommendedFor } = req.body;

  // Validate recommendedFor
  if (typeof recommendedFor !== "boolean") {
    return res
      .status(400)
      .json({ message: "recommendedFor must be a boolean value" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the recommendedFor field
    product.recommendedFor = recommendedFor;

    await product.save();
    res
      .status(200)
      .json({ message: "Product updated to recommended status", product });
  } catch (err) {
    console.error("❌ Error adding recommended product:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update product by ID
exports.updateProduct = async (req, res) => {
  const { id } = req.query;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        if (key === "colorOptions" && Array.isArray(req.body.colorOptions)) {
          product.colorOptions = req.body.colorOptions.map((opt) => ({
            ...opt,
            _id: opt._id || undefined,
          }));
        } else if (
          key === "lensOptions" &&
          Array.isArray(req.body.lensOptions)
        ) {
          product.lensOptions = req.body.lensOptions.map((opt) => ({
            ...opt,
            _id: opt._id || undefined,
          }));
        } else {
          product[key] = req.body[key];
        }
      }
    });
    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", err });
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  const { id } = req.query;
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted", product });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", err });
  }
};

exports.getFaceShapeStats = async (req, res) => {
  try {
    const stats = await RecommendationStat.aggregate([
      { $group: { _id: "$faceShape", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    res.json({ stats, total });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch face shape statistics",
      error: err.message,
    });
  }
};

exports.recommendEyewear = async (req, res) => {
  const { faceShape, lifestyle, occasion, eyeglassStyle } = req.body;
  if (!faceShape) {
    return res.status(400).json({ message: "faceShape is required" });
  }
  try {
    const normalizedFaceShape = faceShape
      .toLowerCase()
      .replace(/ shape$/, "")
      .trim();

    const products = await Product.find({
      specs: {
        $elemMatch: {
          $regex: new RegExp(`^${normalizedFaceShape}`, "i"),
        },
      },
    });

    let filteredProducts = products;

    const filters = [];
    if (lifestyle) filters.push(lifestyle.toLowerCase());
    if (occasion) filters.push(occasion.toLowerCase());
    if (eyeglassStyle) filters.push(eyeglassStyle.toLowerCase());

    if (filters.length > 0) {
      filteredProducts = filteredProducts
        .map((product) => {
          const specMatches = product.specs
            .map((spec) => spec.toLowerCase())
            .filter((spec) => filters.includes(spec));
          return {
            product,
            matchCount: specMatches.length,
          };
        })
        .filter((item) => item.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 5)
        .map((item) => item.product);
    } else {
      filteredProducts = filteredProducts.slice(0, 5);
    }

    const stat = new RecommendationStat({
      faceShape,
      lifestyle,
      occasion,
      eyeglassStyle,
      recommendedProductIds: filteredProducts.map((p) => p._id),
    });
    await stat.save();

    res.status(200).json({
      recommended: filteredProducts,
      statId: stat._id,
    });
  } catch (err) {
    console.error("Error in recommendEyewear:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProductStatistics = async (req, res) => {
  try {
    const { limit = 10, sortBy = "sales" } = req.query;

    const bestSellingProducts = await Product.find()
      .select("name sales price imageUrls")
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit));

    const totalStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalSales: { $sum: "$sales" },
          averageSales: { $avg: "$sales" },
          maxSales: { $max: "$sales" },
          minSales: { $min: "$sales" },
        },
      },
    ]);

    const neverSoldCount = await Product.countDocuments({ sales: 0 });

    res.status(200).json({
      message: "Product statistics retrieved successfully",
      data: {
        bestSellingProducts,
        totalStats: totalStats[0] || {
          totalProducts: 0,
          totalSales: 0,
          averageSales: 0,
          maxSales: 0,
          minSales: 0,
        },
        neverSoldCount,
      },
    });
  } catch (err) {
    console.error("Error getting product statistics:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
