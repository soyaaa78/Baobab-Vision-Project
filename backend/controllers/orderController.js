const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error('Error in getAllOrders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = {getAllOrders};
