// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrls: [String],
  specs: [String],  // e.g., ["Casual", "Stylish", "For Heart-Shaped Faces"]
  stock: Number,
  numStars: { type: Number, default: 5 },
});

module.exports = mongoose.model('Product', productSchema);
