const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  specifications: String,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  date: Date,
  items: [itemSchema],
  placedBy: String,
  userEmail: String,
  status: String,
  paymentMethod: String
});

module.exports = mongoose.model('Order', orderSchema);
