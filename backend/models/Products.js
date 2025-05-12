// models/Product.js
const mongoose = require('mongoose');

const colorOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['solid', 'split', 'swatch'], required: true },
  colors: [String], // Hex codes for 'solid' and 'split'
  swatchUrl: String, // For 'swatch' type
  imageUrl: { type: String, required: true } // Main product image for this color
});

const lensOptionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // Display label (e.g., Built-in UV400 Lenses (FREE))
  price: { type: Number, default: 0 },     // Additional price, in PHP
  type: { type: String, enum: ['builtin', 'tinted', 'adaptive'], default: 'builtin' },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrls: { type: [String], required: true },
  specs: { type: [String], required: true },
  stock: { type: Number, required: true },
  numStars: { type: Number, default: 5 },
  recommendedFor: { type: Boolean, default: false },
  sales: { type: Number, default: 0 },
  colorOptions: [colorOptionSchema],
  lensOptions: [lensOptionSchema] // Embedded as subdocuments
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
