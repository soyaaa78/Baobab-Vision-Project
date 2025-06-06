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
    lensOptions,
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

exports.recommendEyewear = async (req, res) => {
  console.log("run");
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

    console.log(`\n🎯 RECOMMENDATION REQUEST for ${faceShape} face shape:`);
    console.log(
      `   Survey: ${lifestyleActivity} | ${uvProtectionImportance} UV | ${personalStyle} style`
    );
    console.log(
      `   Recommended frame shapes: [${recommendations.frameShapes.join(", ")}]`
    );
    console.log(
      `   Recommended colors: [${recommendations.frameColors.join(", ")}]`
    );
    console.log(
      `   Additional specs: [${recommendations.additionalSpecs.join(", ")}]`
    );

    // Find products that match the recommended frame shapes and colors
    const products = await Product.find({}); // Score and filter products based on recommendations
    let scoredProducts = products.map((product) => {
      let score = 0;
      let reasons = [];

      // Check face shape compatibility
      const normalizedFaceShape = faceShape
        .toLowerCase()
        .replace(/ shape$/, "")
        .trim();
      const faceShapeMatch = product.specs.some((spec) =>
        spec.toLowerCase().includes(normalizedFaceShape)
      );
      if (faceShapeMatch) {
        score += 10;
        reasons.push(`Face shape match (+10): ${normalizedFaceShape}`);
      }

      // Check frame shape recommendations
      recommendations.frameShapes.forEach((recommendedShape) => {
        const shapeMatch = product.specs.some((spec) =>
          spec.toLowerCase().includes(recommendedShape.toLowerCase())
        );
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
      }

      // Check specs compatibility
      product.specs.forEach((spec) => {
        const specLower = spec.toLowerCase();
        recommendations.additionalSpecs.forEach((additionalSpec) => {
          if (specLower.includes(additionalSpec.toLowerCase())) {
            score += 4;
            reasons.push(`Spec match (+4): ${additionalSpec}`);
          }
        });
      });

      // Log recommendation reasoning for products with score > 0
      if (score > 0) {
        console.log(`\n🔍 ${product.name} - Total Score: ${score}`);
        console.log(`   Reasons: ${reasons.join(", ")}`);
        console.log(`   Product specs: [${product.specs.join(", ")}]`);
        if (product.colorOptions && product.colorOptions.length > 0) {
          const colorNames = product.colorOptions.map((c) => c.name).join(", ");
          console.log(`   Available colors: [${colorNames}]`);
        }
      }

      return { product, score };
    }); // Filter products with score > 0 and sort by score
    scoredProducts = scoredProducts
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8) // Get top 8 products
      .map((item) => item.product);

    console.log(`\n📊 RECOMMENDATION SUMMARY:`);
    console.log(`   Total products evaluated: ${products.length}`);
    console.log(`   Products with matching criteria: ${scoredProducts.length}`);
    if (scoredProducts.length > 0) {
      console.log(
        `   Top recommendations: ${scoredProducts
          .map((p) => p.name)
          .join(", ")}`
      );
    }

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
      recommendations: recommendations, // Include the recommendation logic for debugging
    });
  } catch (err) {
    console.error("Error in recommendEyewear:", err);
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
