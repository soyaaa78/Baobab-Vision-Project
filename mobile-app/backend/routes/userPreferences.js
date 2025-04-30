const express = require('express');
const UserPreferences = require('../models/UserPreferences');
const User = require('../models/User');
const Product = require('../models/Products');
const router = express.Router();

// Fetch recommended products based on user's preferences
router.get('/for-you/:username', async (req, res) => {
  try {
    // Step 1: Get the user from the User model using the username
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: Get the user preferences from the UserPreferences collection using userId
    const userPreferences = await UserPreferences.findOne({ userId: user._id });

    if (!userPreferences) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Step 3: Extract the preferences (specs) from the user preferences
    const preferences = userPreferences.preferences;

    // Sort the specs based on their tally (from highest to lowest)
    const sortedPreferences = [...preferences.entries()]
      .sort((a, b) => b[1] - a[1]);  // Sort by tally value

    // Get the top specs (you can take top N specs or just use all sorted specs)
    const topSpecs = sortedPreferences.map(item => item[0]); // All specs sorted by tally

    if (topSpecs.length === 0) {
      return res.status(200).json({ message: 'No preferences found for the user.' });
    }

    // Step 4: Get all products that match any of the top specs
    const recommendedProducts = await Product.find({
      specs: { $in: topSpecs } // Match products with any of the user's top specs
    });

    if (recommendedProducts.length === 0) {
      return res.status(200).json({ message: 'No recommendations found' });
    }

    // Step 5: Return the recommended products based on the top specs
    res.status(200).json(recommendedProducts);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

router.post('/update-preferences/:username', async (req, res) => {
  console.log('Received request body:', req.body);
  const { productId } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the user's preferences or create a new one if not found
    let userPreferences = await UserPreferences.findOne({ userId: user._id });
    if (!userPreferences) {
      userPreferences = new UserPreferences({
        userId: user._id,
        preferences: new Map(),
      });
    }

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productSpecs = product.specs; // Array of specs

    // Update the user preferences tally with the product specs
    productSpecs.forEach((spec) => {
      if (userPreferences.preferences.has(spec)) {
        userPreferences.preferences.set(spec, userPreferences.preferences.get(spec) + 1);
      } else {
        userPreferences.preferences.set(spec, 1);
      }
    });

    await userPreferences.save();

    console.log('Updated user preferences:', userPreferences.preferences);

    res.status(200).json({ message: 'User preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
});




module.exports = router;
