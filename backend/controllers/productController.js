// controllers/productController.js
const Product = require('../models/Products');

// Create product
// Create product
exports.createProduct = async (req, res) => {
  const {
    name, description, price, stock, imageUrls, specs, numStars,
    recommendedFor, sales, colorOptions, lensOptions // ✅ include lensOptions in destructuring
  } = req.body;

  // Validate required fields
  if (!name || !description || !price || !stock || !imageUrls || !specs) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const product = new Product({
      name,
      description,
      price,
      stock,
      imageUrls,
      specs,
      numStars: numStars || 5,
      recommendedFor: recommendedFor || false,
      sales: sales || 0,
      colorOptions: colorOptions || [],
      lensOptions: lensOptions || [] // ✅ add comma before this line
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all products with optional sorting
exports.getAllProducts = async (req, res) => {
  try {
    const { sortBy, order = 'desc' } = req.query;

    let sortCriteria = {};

    switch (sortBy) {
      case 'popular':
        sortCriteria.numStars = order === 'asc' ? 1 : -1;
        break;
      case 'latest':
        sortCriteria.createdAt = order === 'asc' ? 1 : -1;
        break;
      case 'top-sales':
        sortCriteria.sales = order === 'asc' ? 1 : -1;
        break;
      case 'price':
        sortCriteria.price = order === 'asc' ? 1 : -1;
        break;
      default:
        sortCriteria.createdAt = -1; // Default to latest if no sort param
    }

    const products = await Product.find().sort(sortCriteria);
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get recommended products
exports.getRecommendedProducts = async (req, res) => {
  try {
    const recommendedProducts = await Product.find({
      recommendedFor: true,  // Only fetch products where recommendedFor is true
    });

    if (recommendedProducts.length === 0) {
      return res.status(404).json({ message: 'No recommended products found' });
    }

    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ message: 'Error fetching recommended products', error });
  }
};

// Admin adds product to recommended
exports.addProductToRecommended = async (req, res) => {
  const { productId, recommendedFor } = req.body;

  // Validate recommendedFor
  if (typeof recommendedFor !== 'boolean') {
    return res.status(400).json({ message: 'recommendedFor must be a boolean value' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the recommendedFor field
    product.recommendedFor = recommendedFor;

    await product.save();
    res.status(200).json({ message: 'Product updated to recommended status', product });
  } catch (err) {
    console.error('❌ Error adding recommended product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
