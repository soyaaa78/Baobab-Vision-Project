// models/UserCart.js
const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // References Product collection
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  colorOption: {
    type: String, // Store the name or ID of the selected color
    required: true,
  },
  lensOption: { 
    type: String, // Store the name or ID of the selected lens
    required: true,
  },
  prescriptionImage: {
    type: String, // Store URL/path of the prescription image
    required: false,
  }
});

const UserCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [CartItemSchema],
});

module.exports = mongoose.model('UserCart', UserCartSchema);
