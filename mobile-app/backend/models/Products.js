const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrls: { type: [String], required: true },
  specs: { type: [String], required: true },  // e.g., ["Casual", "Stylish", "For Heart-Shaped Faces"]
  stock: { type: Number, required: true },
  numStars: { type: Number, default: 5 },
  
  // New boolean field to mark if the product should appear in the "Recommended for You" section
  recommendedFor: {
    type: Boolean,
    default: false,  // Default to false, meaning it will not be considered for the "Recommended for You" section unless explicitly set to true
  }
});

module.exports = mongoose.model('Product', productSchema);
