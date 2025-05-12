const Product = require('../models/Products');
const UserCart = require('../models/UserCart');

// Controller function to add item to the cart
const addToCart = async (req, res) => {
    const { productId, quantity, colorOptionId, lensOptionId, prescriptionImage } = req.body;
    const userId = req.userId;
  
    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      const colorOption = product.colorOptions.id(colorOptionId);
      const lensOption = product.lensOptions.id(lensOptionId);
  
      if (!colorOption) return res.status(404).json({ message: 'Invalid color option selected' });
      if (!lensOption) return res.status(404).json({ message: 'Invalid lens option selected' });
  
      let userCart = await UserCart.findOne({ userId });
  
      if (!userCart) {
        userCart = new UserCart({ userId, items: [] });
      }
  
      const existingItemIndex = userCart.items.findIndex(item =>
        item.productId.toString() === productId &&
        item.colorOption.toString() === colorOptionId &&
        item.lensOption.toString() === lensOptionId &&
        item.prescriptionImage === prescriptionImage
      );
  
      if (existingItemIndex !== -1) {
        // If the item exists, just update the quantity
        userCart.items[existingItemIndex].quantity += quantity; 
      } else {
        // If the item does not exist, add a new item to the cart
        userCart.items.push({
          productId,
          quantity,
          colorOption: colorOptionId,
          lensOption: lensOptionId,
          prescriptionImage,
        });
      }
  
      await userCart.save();
      res.status(200).json({ message: 'Product added to cart', cart: userCart });
  
    } catch (err) {
      console.error('Error adding to cart:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

// Controller function to update item quantity in the cart
const updateCartQuantity = async (req, res) => {
    const { productId, quantity, colorOptionId, lensOptionId } = req.body;
    const userId = req.userId;
  
    try {
      let userCart = await UserCart.findOne({ userId });
  
      if (!userCart) return res.status(404).json({ message: 'Cart not found' });
  
      const itemIndex = userCart.items.findIndex(item =>
        item.productId.toString() === productId &&
        item.colorOption.toString() === colorOptionId &&
        item.lensOption.toString() === lensOptionId
      );
  
      if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });
  
      if (quantity <= 0) {
        userCart.items.splice(itemIndex, 1); // Remove item from cart if quantity is 0 or less
      } else {
        userCart.items[itemIndex].quantity = quantity; // Update quantity
      }
  
      await userCart.save();
      res.status(200).json({ message: 'Cart updated successfully', cart: userCart });
  
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

// Controller function to get the user's cart
// Controller function to get the user's cart
const getCart = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const userCart = await UserCart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'name price imageUrls colorOptions lensOptions description',
      });
  
      if (!userCart) return res.status(404).json({ message: 'Cart not found' });
  
      let cartTotal = 0;
  
      userCart.items.forEach(item => {
        const productPrice = item.productId.price;
        const lensPrice = item.productId.lensOptions.find(
          lens => lens._id.toString() === item.lensOption
        )?.price || 0;
  
        const quantity = item.quantity;
  
        const itemTotal = (productPrice + lensPrice) * quantity;
        cartTotal += itemTotal;
      });
  
      res.status(200).json({
        cart: userCart,
        cartTotal: cartTotal || 0, // Ensure cartTotal is returned
      });
    } catch (err) {
      console.error('Error getting cart:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

module.exports = {
  addToCart,
  updateCartQuantity,
  getCart,
};
