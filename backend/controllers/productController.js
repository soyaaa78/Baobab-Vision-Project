// controllers/productController.js
const Product = require("../models/Products");
const RecommendationStat = require("../models/RecommendationStat");
const {
  uploadProductFiles,
  uploadMultipleImagesHelper,
  uploadSingleImageHelper,
} = require("./firebaseStorageController");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Use Firebase storage middleware
exports.uploadProductFiles = uploadProductFiles;

// Create product
exports.createProduct = catchAsync(async (req, res, next) => {
  console.log("=== CREATE PRODUCT DEBUG ===");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

  const {
    name,
    description,
    price,
    stock,
    specs,
    numStars,
    recommendedFor,
    sales,
    colorOptions,
    lensOptions,
  } = req.body;

  console.log("Extracted values:");
  console.log("name:", name, "type:", typeof name);
  console.log("description:", description, "type:", typeof description);
  console.log("price:", price, "type:", typeof price);

  // Validate required fields
  if (
    !name ||
    !description ||
    !price ||
    name.trim() === "" ||
    description.trim() === "" ||
    price.toString().trim() === ""
  ) {
    console.log(
      "Validation failed - one or more required fields are missing or empty"
    );
    return res
      .status(400)
      .json({ message: "Name, description, and price are required" });
  }

  // Validate price is a valid number
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res
      .status(400)
      .json({ message: "Price must be a valid number greater than 0" });
  }

  // Parse JSON fields if they come as strings
  let parsedSpecs = [];
  let parsedLensOptions = [];
  let parsedColorOptions = [];

  try {
    parsedSpecs = typeof specs === "string" ? JSON.parse(specs) : specs || [];
    parsedLensOptions =
      typeof lensOptions === "string"
        ? JSON.parse(lensOptions)
        : lensOptions || [];
    parsedColorOptions =
      typeof colorOptions === "string"
        ? JSON.parse(colorOptions)
        : colorOptions || [];
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid JSON format in form data" });
  }

  // Validate that at least one spec is provided
  if (!parsedSpecs || parsedSpecs.length === 0) {
    return res
      .status(400)
      .json({ message: "At least one face shape specification is required" });
  }
  try {
    let imageUrls = [];
    let colorwayImageUrls = [];
    let model3dUrl = null;

    // Handle uploaded files with Firebase Storage
    if (req.files) {
      // Upload product images
      if (req.files.productImages && req.files.productImages.length > 0) {
        imageUrls = await uploadMultipleImagesHelper(
          req.files.productImages,
          "products/images"
        );
      }

      // Upload colorway images
      if (req.files.colorwayImages && req.files.colorwayImages.length > 0) {
        colorwayImageUrls = await uploadMultipleImagesHelper(
          req.files.colorwayImages,
          "products/colorways"
        );
      }

      // Upload 3D model
      if (req.files.model3d && req.files.model3d.length > 0) {
        model3dUrl = await uploadSingleImageHelper(
          req.files.model3d[0],
          "products/models"
        );
      }
    } // Validate that at least one product image is provided
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parseInt(stock) || 0,
      imageUrls,
      specs: parsedSpecs,
      numStars: parseInt(numStars) || 5,
      recommendedFor: recommendedFor === "true" || recommendedFor === true,
      sales: parseInt(sales) || 0,
      colorOptions: parsedColorOptions,
      lensOptions: parsedLensOptions,
      colorwayImageUrls:
        colorwayImageUrls.length > 0 ? colorwayImageUrls : undefined,
      model3dUrl: model3dUrl || undefined,
    });

    await product.save();
    res.status(201).json({
      message: "Product created successfully!",
      product,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});

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
  const {
    faceShape,
    lifestyleActivity,
    uvProtectionImportance,
    personalStyle,
    fitPreference,
    occasionUse,
    colorPreference,
  } = req.body;

  if (!faceShape) {
    return res.status(400).json({ message: "faceShape is required" });
  }
  try {
    // Get recommendation mapping based on survey responses
    const recommendations = getRecommendationMapping({
      faceShape,
      lifestyleActivity,
      uvProtectionImportance,
      personalStyle,
      fitPreference,
      occasionUse,
      colorPreference,
    });

    // Find products that match the recommended frame shapes and colors
    const products = await Product.find({});

    // Score and filter products based on recommendations
    let scoredProducts = products.map((product) => {
      let score = 0;
      let reasons = []; // Check face shape compatibility (product should be suitable for user's face shape)
      const normalizedFaceShape = faceShape
        .toLowerCase()
        .replace(/ shape$/, "")
        .trim();

      const faceShapeMatch = product.specs.some((spec) => {
        const specLower = spec.toLowerCase();
        return (
          specLower.startsWith("face_") &&
          specLower.includes(normalizedFaceShape)
        );
      });

      if (faceShapeMatch) {
        score += 10;
        reasons.push(`Suitable for face shape (+10): ${normalizedFaceShape}`);
      }

      // Check frame shape recommendations (product's frame shape should match recommended shapes)
      recommendations.frameShapes.forEach((recommendedShape) => {
        const shapeMatch = product.specs.some((spec) => {
          const specLower = spec.toLowerCase();
          const recommendedLower = recommendedShape.toLowerCase();

          // Match frame_shape_X patterns
          return (
            specLower.startsWith("frame_") &&
            (specLower.includes(recommendedLower.replace(" ", "_")) ||
              (recommendedLower === "cat eye" &&
                specLower.includes("cat_eye")) ||
              (recommendedLower === "pilot" && specLower.includes("pilot")) ||
              (recommendedLower === "oversized" &&
                specLower.includes("oversized")) ||
              (recommendedLower === "round" && specLower.includes("round")) ||
              (recommendedLower === "square" && specLower.includes("square")) ||
              (recommendedLower === "rectangle" &&
                specLower.includes("rectangle")))
          );
        });

        if (shapeMatch) {
          score += 8;
          reasons.push(`Frame shape match (+8): ${recommendedShape}`);
        }
      });

      // Check color recommendations
      if (product.colorOptions && product.colorOptions.length > 0) {
        recommendations.frameColors.forEach((recommendedColor) => {
          const colorMatch = product.colorOptions.some(
            (colorOption) =>
              colorOption.name
                .toLowerCase()
                .includes(recommendedColor.toLowerCase()) ||
              recommendedColor
                .toLowerCase()
                .includes(colorOption.name.toLowerCase())
          );
          if (colorMatch) {
            score += 6;
            reasons.push(`Color match (+6): ${recommendedColor}`);
          }
        });
      } // Check additional specs compatibility (lifestyle, style preferences, etc.)
      product.specs.forEach((spec) => {
        const specLower = spec.toLowerCase();
        // Only check specs that aren't face_ or frame_ prefixed
        if (!specLower.startsWith("face_") && !specLower.startsWith("frame_")) {
          recommendations.additionalSpecs.forEach((additionalSpec) => {
            if (specLower.includes(additionalSpec.toLowerCase())) {
              score += 4;
              reasons.push(`Spec match (+4): ${additionalSpec}`);
            }
          });
        }
      });
      return { product, score };
    }); // Filter products with score > 0 and sort by score
    scoredProducts = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Get top 8 products      .map((item) => item.product);

    // If no scored products, fall back to face shape matching
    if (scoredProducts.length === 0) {
      const normalizedFaceShape = faceShape
        .toLowerCase()
        .replace(/ shape$/, "")
        .trim();
      scoredProducts = await Product.find({
        specs: {
          $elemMatch: {
            $regex: new RegExp(`^${normalizedFaceShape}`, "i"),
          },
        },
      }).limit(5);
    }

    // Save recommendation statistics
    const stat = new RecommendationStat({
      faceShape,
      lifestyleActivity,
      uvProtectionImportance,
      personalStyle,
      fitPreference,
      occasionUse,
      colorPreference,
      recommendedProductIds: scoredProducts.map((p) => p._id),
    });
    await stat.save();
    res.status(200).json({
      recommended: scoredProducts,
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

function getRecommendationMapping({
  faceShape,
  lifestyleActivity,
  uvProtectionImportance,
  personalStyle,
  fitPreference,
  occasionUse,
  colorPreference,
}) {
  let frameShapes = [];
  let frameColors = [];
  let additionalSpecs = [];

  // Frame shape recommendations based on multiple factors

  // Base recommendations based on face shape
  if (faceShape) {
    const normalizedFaceShape = faceShape.toLowerCase().trim();

    switch (normalizedFaceShape) {
      case "oval":
        frameShapes.push("Rectangle", "Square", "Cat Eye");
        frameColors.push("Black", "Tortoise", "Colors");
        additionalSpecs.push("Versatile", "Classic");
        break;
      case "rectangle":
        frameShapes.push("Round", "Cat Eye", "Oversized");
        frameColors.push("Colors", "Crystal", "Tortoise");
        additionalSpecs.push("Softening", "Rounded");
        break;
      case "round":
        frameShapes.push("Rectangle", "Square", "Cat Eye");
        frameColors.push("Black", "Tortoise", "Crystal");
        additionalSpecs.push("Angular", "Structured");
        break;
      case "square":
        frameShapes.push("Round", "Pilot", "Cat Eye");
        frameColors.push("Crystal", "Colors", "Tortoise");
        additionalSpecs.push("Curved", "Softening");
        break;
      case "heart":
        frameShapes.push("Cat Eye", "Round", "Pilot");
        frameColors.push("Colors", "Crystal", "Tortoise");
        additionalSpecs.push("Bottom Heavy", "Balanced");
        break;
      case "diamond":
        frameShapes.push("Cat Eye", "Oversized", "Round");
        frameColors.push("Colors", "Crystal", "Black");
        additionalSpecs.push("Fuller Frames", "Softening");
        break;
      case "triangle":
        frameShapes.push("Cat Eye", "Oversized", "Round");
        frameColors.push("Colors", "Tortoise", "Crystal");
        additionalSpecs.push("Top Heavy", "Balancing");
        break;
    }
  }

  // Lifestyle Activity influence
  if (lifestyleActivity === "Sports/Outdoor Adventures") {
    frameShapes.push("Pilot", "Rectangle");
    frameColors.push("Black", "Tortoise");
    additionalSpecs.push("Sport", "Durable", "Secure Fit");
  } else if (lifestyleActivity === "Relaxed Outings") {
    frameShapes.push("Round", "Cat Eye");
    frameColors.push("Crystal", "Colors");
    additionalSpecs.push("Casual", "Comfortable");
  } else if (lifestyleActivity === "Travel/Exploring") {
    frameShapes.push("Oversized");
    frameColors.push("Crystal", "Black");
    additionalSpecs.push("Lightweight", "UV Protection");
  } else if (lifestyleActivity === "Fashion/Statement") {
    frameShapes.push("Cat Eye", "Oversized");
    frameColors.push("Colors", "Tortoise");
    additionalSpecs.push("Fashion", "Statement", "Trendy");
  }

  // UV Protection influence
  if (uvProtectionImportance === "Very Important") {
    frameShapes.push("Rectangle", "Pilot");
    frameColors.push("Black", "Crystal");
    additionalSpecs.push("UV Protection", "Polarized");
  } else if (uvProtectionImportance === "Somewhat Important") {
    frameShapes.push("Round", "Cat Eye");
    frameColors.push("Tortoise", "Black");
  } else if (uvProtectionImportance === "Not Very Important") {
    frameShapes.push("Oversized");
    frameColors.push("Colors");
    additionalSpecs.push("Fashion");
  }

  // Personal Style influence
  if (personalStyle === "Classic & Timeless") {
    frameShapes.push("Square", "Rectangle");
    frameColors.push("Black", "Tortoise");
    additionalSpecs.push("Classic", "Timeless");
  } else if (personalStyle === "Bold & Trendy") {
    frameShapes.push("Oversized", "Cat Eye");
    frameColors.push("Colors", "Tortoise");
    additionalSpecs.push("Bold", "Trendy", "Statement");
  } else if (personalStyle === "Sporty & Functional") {
    frameShapes.push("Pilot", "Rectangle");
    frameColors.push("Black", "Crystal");
    additionalSpecs.push("Sport", "Functional", "Durable");
  } else if (personalStyle === "Minimalist") {
    frameShapes.push("Round", "Pilot");
    frameColors.push("Crystal", "Black");
    additionalSpecs.push("Minimalist", "Simple", "Clean");
  }

  // Fit Preference influence
  if (fitPreference === "I need a snug fit") {
    frameShapes.push("Rectangle", "Pilot");
    frameColors.push("Black", "Tortoise");
    additionalSpecs.push("Secure Fit", "Sport");
  } else if (fitPreference === "I prefer a more relaxed, loose fit") {
    frameShapes.push("Cat Eye", "Round");
    frameColors.push("Colors", "Crystal");
    additionalSpecs.push("Comfortable", "Relaxed");
  } else if (fitPreference === "I like a mix of both") {
    frameShapes.push("Oversized", "Square");
    frameColors.push("Black", "Tortoise");
  }

  // Occasion Use influence
  if (occasionUse === "Daily, All Day Wear") {
    frameShapes.push("Pilot", "Rectangle");
    frameColors.push("Black", "Crystal");
    additionalSpecs.push("Comfortable", "Durable", "Versatile");
  } else if (occasionUse === "Special Occasions/Outings") {
    frameShapes.push("Cat Eye", "Oversized");
    frameColors.push("Colors", "Tortoise");
    additionalSpecs.push("Fashion", "Statement");
  } else if (occasionUse === "Driving or Commuting") {
    frameShapes.push("Rectangle", "Pilot");
    frameColors.push("Black", "Polarized");
    additionalSpecs.push("Polarized", "UV Protection");
  } else if (occasionUse === "Sport/Activity-Specific") {
    frameShapes.push("Pilot", "Rectangle");
    frameColors.push("Black", "Crystal");
    additionalSpecs.push("Sport", "Secure Fit", "Durable");
  }

  // Color Preference influence
  if (colorPreference === "Neutral & Classic") {
    frameColors.push("Black", "Tortoise", "Crystal");
    additionalSpecs.push("Classic", "Neutral");
  } else if (colorPreference === "Bold & Vibrant") {
    frameColors.push("Colors", "Bright");
    additionalSpecs.push("Bold", "Vibrant", "Statement");
  } else if (colorPreference === "Earthy & Natural") {
    frameColors.push("Tortoise", "Brown", "Green");
    additionalSpecs.push("Natural", "Earthy");
  } else if (colorPreference === "Metallic & Sleek") {
    frameColors.push("Gold", "Silver", "Chrome");
    additionalSpecs.push("Metallic", "Sleek", "Modern");
  }

  // Remove duplicates and return top recommendations
  frameShapes = [...new Set(frameShapes)].slice(0, 3);
  frameColors = [...new Set(frameColors)].slice(0, 3);
  additionalSpecs = [...new Set(additionalSpecs)];

  return {
    frameShapes,
    frameColors,
    additionalSpecs,
  };
}
