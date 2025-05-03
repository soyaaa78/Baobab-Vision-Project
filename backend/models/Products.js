const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrls: { type: [String], required: true },
  specs: { type: [String], required: true },
  stock: { type: Number, required: true },
  numStars: { type: Number, default: 5 },            // ⭐ Popularity indicator
  recommendedFor: { type: Boolean, default: false },
  sales: { type: Number, default: 0 },               // 🔥 Track top-selling products
}, { timestamps: true });                             // 🕒 Enables createdAt & updatedAt

module.exports = mongoose.model('Product', productSchema);
