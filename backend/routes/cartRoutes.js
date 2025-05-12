const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middlewares/authMiddleware'); // Assuming you have an authentication middleware

// Route to add a product to the cart
router.post('/add', authenticate, cartController.addToCart);

// Route to update the quantity of a product in the cart
router.put('/update', authenticate, cartController.updateCartQuantity);

// Route to get the user's cart
router.get('/:userId', authenticate, cartController.getCart);

module.exports = router;
