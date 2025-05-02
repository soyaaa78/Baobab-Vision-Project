const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrls: { type: [String], required: true },  // Simple array of image URLs
  specs: { type: [String], required: true },
  stock: { type: Number, required: true },
  numStars: { type: Number, default: 5 },
  recommendedFor: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', productSchema);
