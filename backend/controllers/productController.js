// controllers/productController.js
const mongoose = require("mongoose");
const Product = require("../models/Products");
const Rating = require("../models/Order/Rating");
const Order = require("../models/Order");
const RecommendationStat = require("../models/RecommendationStat");
const {
  uploadProductFiles,
  uploadMultipleImagesHelper,
  uploadSingleImageHelper,
} = require("./firebaseStorageController");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { logEvent } = require("../services/auditLogService");

// Helper: normalize string for fuzzy name matching
const normalizeStr = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

// Helper: map uploaded files to color option indices based on name substring
// Returns an array where index = file index, value = matched option index
const mapFilesToOptionsByName = (files, colorOptions = []) => {
  if (!Array.isArray(files) || !Array.isArray(colorOptions) || !files.length)
    return [];

  const normOptionNames = colorOptions.map((opt) => normalizeStr(opt?.name));
  const used = new Set();
  const mapping = [];

  files.forEach((file, fileIdx) => {
    const fname = normalizeStr(file?.originalname || "");
    let matchIdx = -1;

    // Prefer substring match both ways
    for (let i = 0; i < normOptionNames.length; i++) {
      if (used.has(i)) continue;
      const oname = normOptionNames[i];
      if (!oname) continue;
      if (fname.includes(oname) || oname.includes(fname)) {
        matchIdx = i;
        break;
      }
    }

    // Fallback to first unused index
    if (matchIdx === -1) {
      for (let i = 0; i < normOptionNames.length; i++) {
        if (!used.has(i)) {
          matchIdx = i;
          break;
        }
      }
    }

    if (matchIdx !== -1) used.add(matchIdx);
    mapping[fileIdx] = matchIdx; // can be undefined if no options
  });

  return mapping;
};

// Use Firebase storage middleware
exports.uploadProductFiles = uploadProductFiles;

// Create product
exports.createProduct = catchAsync(async (req, res, next) => {
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

  // Validate required fields
  if (
    !name ||
    !description ||
    !price ||
    name.trim() === "" ||
    description.trim() === "" ||
    price.toString().trim() === ""
  ) {
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
    let colorwayModels3dUrls = [];
    let colorwayModelsMap = [];

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

      // Upload 3D model (main/default)
      if (req.files.model3d && req.files.model3d.length > 0) {
        model3dUrl = await uploadSingleImageHelper(
          req.files.model3d[0],
          "products/models"
        );
      }

      // Upload per-colorway 3D models (align by index with colorway images/options)
      if (req.files.colorwayModels3d && req.files.colorwayModels3d.length > 0) {
        // Build name-based mapping before upload so we can assign URLs correctly after
        colorwayModelsMap = mapFilesToOptionsByName(
          req.files.colorwayModels3d,
          Array.isArray(parsedColorOptions) ? parsedColorOptions : []
        );
        colorwayModels3dUrls = await uploadMultipleImagesHelper(
          req.files.colorwayModels3d,
          "products/models"
        );
      }
    } // Validate that at least one product image is provided
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }
    // If colorOptions provided, merge imageUrl and optional model3d per color
    // Build a reverse map: optionIndex -> url chosen for that option (first match wins)
    const optionIndexToModelUrl = {};
    if (Array.isArray(colorwayModels3dUrls) && colorwayModels3dUrls.length) {
      colorwayModels3dUrls.forEach((url, fileIdx) => {
        const optIdx = colorwayModelsMap[fileIdx];
        if (
          typeof optIdx === "number" &&
          optionIndexToModelUrl[optIdx] == null
        ) {
          optionIndexToModelUrl[optIdx] = url;
        }
      });
    }

    let mergedColorOptions = Array.isArray(parsedColorOptions)
      ? parsedColorOptions.map((opt, idx) => ({
          ...opt,
          imageUrl:
            (opt && opt.imageUrl) || colorwayImageUrls[idx] || opt?.imageUrl,
          // Only assign per-colorway 3D model if a mapped URL exists; avoid index fallback to prevent misassignment
          model3dUrl: optionIndexToModelUrl[idx] ?? opt?.model3dUrl,
        }))
      : [];

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
      colorOptions: mergedColorOptions,
      lensOptions: parsedLensOptions,
      colorwayImageUrls:
        colorwayImageUrls.length > 0 ? colorwayImageUrls : undefined,
      model3dUrl: model3dUrl || undefined,
    });

    await product.save();
    // Audit: add product
    logEvent(req, {
      eventType: "product",
      action: `Created product (${product.name})`,
      targetModel: "Product",
      targetId: product._id,
      newValues: product.toObject(),
    });
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
  const { id, sortBy, order = "desc" } = req.query;
  try {
    // Single product fetch bypasses sorting
    if (id) {
      const product = await Product.findById(id);
      return res.status(200).json(product);
    }

    const dir = order === "asc" ? 1 : -1;
    let products = [];

    if (!sortBy || !sortBy.trim()) {
      products = await Product.find();
      return res.status(200).json(products);
    }

    switch (sortBy) {
      case "price": {
        products = await Product.find().sort({ price: dir });
        break;
      }
      case "top-sales":
      case "sales": {
        products = await Product.find().sort({ sales: dir });
        break;
      }
      case "latest": {
        products = await Product.find().sort({ createdAt: dir });
        break;
      }
      case "popular": {
        // Popularity heuristic: (sales * weightSales) + (numStars * weightStars)
        const weightSales = 1; // adjust if needed
        const weightStars = 10; // amplify star influence
        const raw = await Product.find();
        products = raw
          .map((p) => {
            const sales = Number(p.sales) || 0;
            const stars = Number(p.numStars) || 0;
            const score = sales * weightSales + stars * weightStars;
            return { p, score };
          })
          .sort((a, b) => (dir === 1 ? a.score - b.score : b.score - a.score))
          .map((x) => ({ ...x.p.toObject(), popularityScore: x.score }));
        return res.status(200).json(products);
      }
      default: {
        products = await Product.find();
      }
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get recommended products with aggregated average rating (fast aggregate vs per-doc lookups)
exports.getRecommendedProducts = async (req, res) => {
  try {
    // Pull only recommended products first (limit could be added later if needed)
    const recommendedProducts = await Product.find({ recommendedFor: true });

    if (recommendedProducts.length === 0) {
      return res.status(404).json({ message: "No recommended products found" });
    }

    const productIds = recommendedProducts.map((p) => p._id);

    // Aggregate ratings per product by joining orders and expanding productIds
    const productRatings = await Rating.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDoc",
        },
      },
      { $unwind: "$orderDoc" },
      { $match: { "orderDoc.products.productId": { $in: productIds } } },
      {
        $project: {
          rating: 1,
          productIds: "$orderDoc.products.productId",
        },
      },
      { $unwind: "$productIds" },
      { $match: { productIds: { $in: productIds } } },
      {
        $group: {
          _id: "$productIds",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = productRatings.reduce((acc, r) => {
      acc[r._id.toString()] = { avg: r.avgRating, count: r.count };
      return acc;
    }, {});

    // Shape response: include averageRating (1dp), ratingCount
    const shaped = recommendedProducts.map((p) => {
      const base = p.toObject();
      const r = ratingMap[p._id.toString()];
      // If there are ratings, compute rounded 1dp; otherwise expose null to indicate no ratings yet
      const avg = r ? Math.round(r.avg * 10) / 10 : null;
      return {
        ...base,
        averageRating: avg,
        ratingCount: r ? r.count : 0,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({
      message: "Error fetching recommended products",
      error: error.message,
    });
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

    const oldValues = { recommendedFor: !recommendedFor };
    await product.save();
    // Audit: recommended toggle
    logEvent(req, {
      eventType: "product",
      action: `Updated product recommendation status (${product.name})`,
      targetModel: "Product",
      targetId: product._id,
      oldValues,
      newValues: { recommendedFor },
    });
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

    const oldValues = product.toObject();
    // Normalize/parse incoming fields (multipart sends JSON fields as strings)
    const body = { ...req.body };
    ["colorOptions", "lensOptions", "specs", "colorwayModelTargets"].forEach(
      (k) => {
        if (typeof body[k] === "string") {
          try {
            body[k] = JSON.parse(body[k]);
          } catch (e) {
            // ignore parse error; leave as-is
          }
        }
      }
    );

    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        // Allow null values through to handle model removal
        if (key === "colorOptions" && Array.isArray(body.colorOptions)) {
          product.colorOptions = body.colorOptions.map((opt) => ({
            ...opt,
            _id: opt._id || undefined,
          }));
        } else if (key === "lensOptions" && Array.isArray(body.lensOptions)) {
          product.lensOptions = body.lensOptions.map((opt) => ({
            ...opt,
            _id: opt._id || undefined,
          }));
        } else {
          product[key] = body[key];
        }
      }
    });

    // Handle uploaded files for updates
    if (req.files) {
      // Replace main gallery images
      if (req.files.productImages && req.files.productImages.length > 0) {
        const urls = await uploadMultipleImagesHelper(
          req.files.productImages,
          "products/images"
        );
        product.imageUrls = urls;
      }

      // Replace colorway images
      if (req.files.colorwayImages && req.files.colorwayImages.length > 0) {
        const urls = await uploadMultipleImagesHelper(
          req.files.colorwayImages,
          "products/colorways"
        );
        product.colorwayImageUrls = urls;
        // Also reflect in colorOptions.imageUrl if aligned
        if (
          Array.isArray(product.colorOptions) &&
          product.colorOptions.length
        ) {
          product.colorOptions = product.colorOptions.map((opt, idx) => ({
            ...opt,
            imageUrl: urls[idx] || opt.imageUrl,
          }));
        }
      }

      // Replace main 3D model
      if (req.files.model3d && req.files.model3d.length > 0) {
        const url = await uploadSingleImageHelper(
          req.files.model3d[0],
          "products/models"
        );
        product.model3dUrl = url;
      }

      // Replace/assign per-colorway 3D models; prefer name-based mapping over index
      if (req.files.colorwayModels3d && req.files.colorwayModels3d.length > 0) {
        // Prefer explicit index mapping when provided by client
        let mapping = [];
        const targets = Array.isArray(body.colorwayModelTargets)
          ? body.colorwayModelTargets
          : [];

        if (
          Array.isArray(targets) &&
          targets.length === req.files.colorwayModels3d.length &&
          targets.every((n) => Number.isInteger(n) && n >= 0)
        ) {
          mapping = targets;
        } else {
          mapping = mapFilesToOptionsByName(
            req.files.colorwayModels3d,
            Array.isArray(product.colorOptions) ? product.colorOptions : []
          );
        }
        const urls = await uploadMultipleImagesHelper(
          req.files.colorwayModels3d,
          "products/models"
        );
        if (
          Array.isArray(product.colorOptions) &&
          product.colorOptions.length
        ) {
          const byOptionIdx = {};
          urls.forEach((url, fileIdx) => {
            const optIdx = mapping[fileIdx];
            if (
              typeof optIdx === "number" &&
              optIdx >= 0 &&
              byOptionIdx[optIdx] == null
            ) {
              byOptionIdx[optIdx] = url;
            }
          });
          product.colorOptions = product.colorOptions.map((opt, idx) => ({
            ...(opt.toObject?.() || opt),
            model3dUrl: byOptionIdx[idx] || opt.model3dUrl,
          }));
        }
      }
    }
    await product.save();
    // Audit: edit product
    logEvent(req, {
      eventType: "product",
      action: `Updated product details (${product.name})`,
      targetModel: "Product",
      targetId: product._id,
      oldValues,
      newValues: product.toObject(),
    });
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
    // Audit: delete product
    logEvent(req, {
      eventType: "product",
      action: `Deleted product (${product.name || id})`,
      targetModel: "Product",
      targetId: id,
      oldValues: product,
    });
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

// Get products with 3D models
exports.getProductsWith3DModels = catchAsync(async (req, res, next) => {
  try {
    const products = await Product.find({
      $or: [
        { model3dUrl: { $exists: true, $ne: null, $ne: "" } },
        { "colorOptions.model3dUrl": { $exists: true, $ne: null, $ne: "" } },
      ],
    }).select(
      "name description price imageUrls model3dUrl specs colorOptions lensOptions stock sales numStars"
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products with 3D models found",
        count: 0,
        products: [],
      });
    }

    // Shape response to include colorway models summary
    const shaped = products.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      const colorwayModels = Array.isArray(doc.colorOptions)
        ? doc.colorOptions
            .map((opt) => ({ name: opt.name, model3dUrl: opt.model3dUrl }))
            .filter((o) => o.model3dUrl)
        : [];
      return { ...doc, colorwayModels };
    });

    res.status(200).json({
      message: "Products with 3D models retrieved successfully",
      count: shaped.length,
      products: shaped,
    });
  } catch (error) {
    console.error("Error fetching products with 3D models:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

exports.getProductReviews = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Product id is required" });

  let productObjectId;
  try {
    productObjectId = new mongoose.Types.ObjectId(id);
  } catch (e) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const reviews = await Rating.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "orderLookup",
      },
    },
    { $unwind: "$orderLookup" },
    {
      $match: {
        "orderLookup.products.productId": productObjectId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userLookup",
      },
    },
    { $unwind: "$userLookup" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        pictures: 1,
        createdAt: 1,
        adminResponse: 1,
        respondedAt: 1,
        user: {
          username: "$userLookup.username",
          profileImage: "$userLookup.profileImage",
        },
      },
    },
  ]);

  // Compute stats from the reviews result
  const total = reviews.length;
  if (total === 0) {
    return res.status(200).json({
      count: 0,
      reviews: [],
      stats: {
        average: 0,
        averageRoundedUp1dp: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        withMedia: 0,
      },
    });
  }

  let sum = 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let withMedia = 0;
  for (const r of reviews) {
    const rating = Number(r.rating) || 0;
    sum += rating;
    const star = Math.max(1, Math.min(5, Math.round(rating)));
    distribution[star] += 1;
    if (Array.isArray(r.pictures) && r.pictures.length > 0) withMedia += 1;
  }
  const average = sum / total;
  const averageRoundedUp1dp = Math.ceil(average * 10) / 10;

  return res.status(200).json({
    count: total,
    reviews,
    stats: {
      average,
      averageRoundedUp1dp,
      total,
      distribution,
      withMedia,
    },
  });
});

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
