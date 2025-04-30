const express = require('express');
const router = express.Router();
const Product = require('../models/Products');
const UserPreferences = require('../models/UserPreferences');

// CREATE a new product
// Create product (POST /api/products)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, imageUrls, specs, numStars } = req.body;

const product = new Product({
  name,
  description,
  price,
  stock,
  imageUrls,
  specs,
  numStars
});


    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/for-you/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userPref = await UserPreferences.findOne({ userId });

    if (!userPref) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Get user's preferred specs
    const preferredSpecs = Array.from(userPref.preferences.keys());

    // Fetch products that match any of the preferred specs
    const recommendedProducts = await Product.find({
      specs: { $in: preferredSpecs },
    });

    res.status(200).json(recommendedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommended products', error });
  }
});


module.exports = router;
