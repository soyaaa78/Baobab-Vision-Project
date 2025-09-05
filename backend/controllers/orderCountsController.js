const Order = require("../models/Order");

const getOrderCounts = async (req, res) => {
  try {
    const customerId = req.userId;
    const orders = await Order.find({ customer: customerId });

    const counts = {
      pending: 0,
      processing: 0,
      ready_to_pickup: 0,
      to_rate: 0,
    };

    orders.forEach(order => {
      if (order.status === "pending") counts.pending++;
      if (order.status === "processing") counts.processing++;
      if (order.status === "ready_to_pickup") counts.ready_to_pickup++;
      if (order.status === "completed" && !order.rating) counts.to_rate++;
    });

    res.json(counts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order counts" });
  }
};

module.exports = { getOrderCounts };