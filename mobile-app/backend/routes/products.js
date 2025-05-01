const express = require('express');
const router = express.Router();
const Product = require('../models/Products');

// Create product (POST /api/products)
router.post('/', async (req, res) => {
  const { name, description, price, stock, imageUrls, specs, numStars, recommendedFor } = req.body;

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
      numStars: numStars || 5,  // Default to 5 stars if not provided
      recommendedFor: recommendedFor || false,  // Default to false
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all products (GET /api/products)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();  // Returns all products in the catalog
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET recommended products for "Recommended for You" section (GET /api/products/for-you)
router.get('/for-you', async (req, res) => {
  try {
    // Fetch all products where "recommendedFor" is true
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
});

// Admin adds product to recommended (POST /api/products/recommended)
router.post('/recommended', async (req, res) => {
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
});

module.exports = router;
