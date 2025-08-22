const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Products");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const UserCart = require("../models/UserCart");

// Get Order by id or customer
const order_get = catchAsync(async (req, res, next) => {
  const { id, customer, index } = req.query;

  let order;

  if (!id && !customer && !index)
    return next(new AppError("Order identifier not found", 400));

  if (id) {
    order = await Order.findById(id)
      .populate("customer", "-password")
      .populate("products.productId");
  } else if (customer) {
    order = await Order.find({ customer })
      .populate("customer", "-password")
      .populate("products.productId");
  } else if (index) {
    order = await Order.find()
      .populate("customer", "-password")
      .populate("products.productId");
  }

  if (!order) return next(new AppError("Order not found.", 404));

  return res.status(200).json({
    message: "Order(s) Successfully Fetched",
    order,
  });
});

// Create Order
const order_post = catchAsync(async (req, res, next) => {
  const { customer, products, address, contactNumber, paymentMethod } =
    req.body;

  if (!customer || !products)
    return next(new AppError("Cannot create order, missing fields.", 400));
  const date = Date.now();

  let totalAmount = 0;
  if (Array.isArray(products)) {
    totalAmount = products.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return sum + quantity * price;
    }, 0);
  }

  const newOrder = new Order({
    customer,
    products,
    date,
    address,
    contactNumber,
    totalAmount,
    paymentMethod,
  });
  await newOrder.save();

  if (Array.isArray(products)) {
    for (const item of products) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { sales: item.quantity || 1 } },
          { new: true }
        );
      }
    }
  }

  return res
    .status(201)
    .json({ message: "Order Successfully Created", newOrder });
});

// Update Order
const order_put = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const {
    customer,
    products,
    date,
    address,
    contactNumber,
    totalAmount,
    paymentMethod,
    status,
  } = req.body;

  if (!id) return next(new AppError("Order identifier not found", 400));

  if (
    !customer &&
    !products &&
    !date &&
    !address &&
    !contactNumber &&
    !totalAmount &&
    !paymentMethod &&
    !status
  )
    return next(new AppError("No data to update", 400));

  const order = await Order.findById(id);
  if (!order) return next(new AppError("Order not found. Invalid ID.", 404));

  let updates = {};
  if (customer) updates.customer = customer;
  if (products) updates.products = products;
  if (date) updates.date = date;
  if (address) updates.address = address;
  if (contactNumber) updates.contactNumber = contactNumber;
  if (totalAmount) updates.totalAmount = totalAmount;
  if (paymentMethod) updates.paymentMethod = paymentMethod;
  if (status) updates.status = status;

  const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedOrder) return next(new AppError("Order not found", 404));

  return res
    .status(200)
    .json({ message: "Order Updated Successfully", updatedOrder });
});

// Delete Order
const order_delete = catchAsync(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new AppError("Order identifier not found", 400));

  const order = await Order.findById(id);
  if (!order) return next(new AppError("Order not found", 404));

  const deletedOrder = await Order.findByIdAndDelete(id);

  if (!deletedOrder) return next(new AppError("Order not found", 404));

  return res
    .status(200)
    .json({ message: "Order Successfully Deleted", deletedOrder });
});

const checkoutFromCart = catchAsync(async (req, res, next) => {
  const userId = req.userId; // from auth middleware
  const { address, contactNumber, paymentMethod } = req.body;

  if (!paymentMethod) {
    return next(new AppError("Payment method is required", 400));
  }

  // 1. Get user's cart
  const userCart = await UserCart.findOne({ userId }).populate({
    path: "items.productId",
    select: "price name",
  });

  if (!userCart || userCart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // 2. Map cart items into Order's product format
  const products = userCart.items.map((item) => {
    const lensPrice = item.productId.lensOptions?.find(
      (lens) => lens._id.toString() === item.lensOption
    )?.price || 0;

    const price = item.productId.price + lensPrice;

    return {
      productId: item.productId._id,
      quantity: item.quantity,
      color: item.colorOption,
      lens: item.lensOption,
      price: price,
    };
  });

  // 3. Calculate total amount
  const totalAmount = products.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // 4. Create order
  const newOrder = new Order({
    customer: userId,
    products,
    date: new Date(),
    address,
    contactNumber,
    totalAmount,
    paymentMethod,
    status: "pending",
  });

  await newOrder.save();

  // 5. Update sales count for products
  for (const item of products) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { sales: item.quantity } },
      { new: true }
    );
  }

  // 6. Clear the cart after checkout
  userCart.items = [];
  await userCart.save();

  return res.status(201).json({
    message: "Order placed successfully",
    order: newOrder,
  });
});


module.exports = {
  order_get,
  order_post,
  order_put,
  order_delete,
  checkoutFromCart,
};