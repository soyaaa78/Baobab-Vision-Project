const Order = require("../models/Order");
const Product = require("../models/Products");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const UserCart = require("../models/UserCart");
const mongoose = require("mongoose");
const ProofOfPayment = require("../models/Order/ProofOfPayment");
const crypto = require("crypto");
const { logEvent } = require("../services/auditLogService");

// Generate a user-friendly, unique orderId (e.g., ORD-20250829-3F9A2C)
const generateOrderId = async () => {
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidate = `BV-${yyyymmdd}-${rand}`;
    const exists = await Order.exists({ orderId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate a unique orderId after several attempts");
};

// Get Order by id or customer
const order_get = catchAsync(async (req, res, next) => {
  const { id, customer, index, status, deliveryMethod } = req.query;

  let order;
  // Build query object
  let queryObj = {};

  if (id) {
    // Find by ID
    order = await Order.findById(id)
      .populate("customer", "-password")
      .populate("products.productId")
      .populate("address")
      .populate("proofOfPayment")
      .populate("rating");
  } else {
    // Build query for list
    if (customer) queryObj.customer = customer;
    if (typeof status !== "undefined") {
      if (Array.isArray(status)) {
        queryObj.status = { $in: status };
      } else {
        queryObj.status = status;
      }
    }
    if (deliveryMethod) queryObj.deliveryMethod = deliveryMethod;
    // If no id/customer/index, use req.userId if available
    if (!customer && !index && req.userId) {
      queryObj.customer = req.userId;
    }
    // If index is provided, ignore customer/status and get all
    if (index) {
      order = await Order.find()
        .populate("customer", "-password")
        .populate("products.productId")
        .populate("address")
        .populate("proofOfPayment")
        .populate("rating");
    } else {
      order = await Order.find(queryObj)
        .populate("customer", "-password")
        .populate("products.productId")
        .populate("address")
        .populate("proofOfPayment")
        .populate("rating");
    }
  }

  if (!order) return next(new AppError("Order not found.", 404));

  return res.status(200).json({
    message: "Order(s) Successfully Fetched",
    order,
  });
});

// Create Order
const order_post = catchAsync(async (req, res, next) => {
  const {
    customer,
    products,
    address,
    contactNumber,
    paymentMethod,
    deliveryMethod,
    thirdPartyDelivery,
    proofOfPayment,
    rating,
    cancellationReason,
    declineReason,
  } = req.body;

  if (!customer || !products)
    return next(new AppError("Cannot create order, missing fields.", 400));
  const date = Date.now();

  // Generate friendly orderId
  let orderId;
  try {
    orderId = await generateOrderId();
  } catch (e) {
    return next(new AppError("Could not generate order id", 500));
  }

  let totalAmount = 0;
  if (Array.isArray(products)) {
    totalAmount = products.reduce((sum, item) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return sum + quantity * price;
    }, 0);
  }

  // Basic validation between delivery fields
  if (
    typeof deliveryMethod !== "undefined" &&
    deliveryMethod === "Third-Party Delivery" &&
    !thirdPartyDelivery
  ) {
    return next(
      new AppError(
        "thirdPartyDelivery is required when deliveryMethod is 'Third-Party Delivery'",
        400
      )
    );
  }

  const newOrder = new Order({
    orderId,
    customer,
    products,
    date,
    address, // expecting an Address ObjectId if provided
    contactNumber,
    totalAmount,
    paymentMethod,
    // Optional new fields
    deliveryMethod,
    // Only set thirdPartyDelivery if provided (schema default handles otherwise)
    ...(thirdPartyDelivery ? { thirdPartyDelivery } : {}),
    ...(proofOfPayment ? { proofOfPayment } : {}),
    ...(rating ? { rating } : {}),
    ...(cancellationReason ? { cancellationReason } : {}),
    ...(declineReason ? { declineReason } : {}),
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
    .json({ message: "Order Successfully Created", order: newOrder });
});

// Update Order
const order_put = catchAsync(async (req, res, next) => {
  let { id } = req.query;
  if (!id && req.body && req.body.id) id = req.body.id;
  const {
    customer,
    products,
    date,
    address,
    contactNumber,
    totalAmount,
    paymentMethod,
    status,
    deliveryMethod,
    thirdPartyDelivery,
    proofOfPayment,
    rating,
    cancellationReason,
    declineReason,
  } = req.body;

  if (!id) return next(new AppError("Order identifier not found", 400));
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError("Invalid order id format", 400));

  if (
    !customer &&
    !products &&
    !date &&
    !address &&
    !contactNumber &&
    typeof totalAmount === "undefined" &&
    !paymentMethod &&
    !status &&
    !deliveryMethod &&
    !thirdPartyDelivery &&
    !proofOfPayment &&
    !rating &&
    typeof cancellationReason === "undefined" &&
    typeof declineReason === "undefined"
  )
    return next(new AppError("No data to update", 400));

  const order = await Order.findById(id);
  if (!order) return next(new AppError("Order not found. Invalid ID.", 404));

  let updates = {};
  if (typeof customer !== "undefined") updates.customer = customer;
  if (typeof products !== "undefined") updates.products = products;
  if (typeof date !== "undefined") updates.date = date;
  if (typeof address !== "undefined") updates.address = address;
  if (typeof contactNumber !== "undefined")
    updates.contactNumber = contactNumber;
  if (typeof totalAmount !== "undefined") updates.totalAmount = totalAmount;
  if (typeof paymentMethod !== "undefined")
    updates.paymentMethod = paymentMethod;
  if (typeof status !== "undefined") updates.status = status;
  if (typeof deliveryMethod !== "undefined")
    updates.deliveryMethod = deliveryMethod;
  if (typeof thirdPartyDelivery !== "undefined")
    updates.thirdPartyDelivery = thirdPartyDelivery;
  if (typeof proofOfPayment !== "undefined")
    updates.proofOfPayment = proofOfPayment;
  if (typeof rating !== "undefined") updates.rating = rating;
  if (typeof cancellationReason !== "undefined")
    updates.cancellationReason = cancellationReason;
  if (typeof declineReason !== "undefined")
    updates.declineReason = declineReason;

  const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedOrder) return next(new AppError("Order not found", 404));

  // Audit: Log staff actions on order updates
  if (
    req.user &&
    (req.user.role === "system_admin" || req.user.role?.startsWith("staff"))
  ) {
    const oldStatus = order.status;
    const newStatus = updatedOrder.status;

    // Log status updates
    if (status && oldStatus !== newStatus) {
      const ordId = updatedOrder.orderId || updatedOrder._id?.toString();
      let action = `Status Updated to ${newStatus} for order ${ordId}`;
      const metadata = { oldStatus, newStatus, orderId: ordId };

      // Special logging for payment approval/disapproval
      if (updatedOrder.paymentMethod === "Gcash") {
        if (oldStatus === "pending" && newStatus === "processing") {
          action = `Payment Approved for order ${ordId}`;
        } else if (oldStatus === "pending" && newStatus === "cancelled") {
          action = `Payment Disapproved for order ${ordId}`;
        }
      }

      // Special logging for cancellation approval
      if (oldStatus === "cancelled_pending" && newStatus === "cancelled") {
        action = `Cancellation Approved for order ${ordId}`;
      } else if (
        oldStatus === "cancelled_pending" &&
        newStatus === "processing"
      ) {
        action = `Cancellation Disapproved for order ${ordId}`;
      }

      logEvent(req, {
        eventType: "order",
        action,
        targetModel: "Order",
        targetId: updatedOrder._id,
        oldValues: { status: oldStatus },
        newValues: { status: newStatus },
        metadata,
      });
    }
  }

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

  // Audit: Log staff order deletion
  if (
    req.user &&
    (req.user.role === "system_admin" || req.user.role?.startsWith("staff"))
  ) {
    const ordId = deletedOrder.orderId || id;
    logEvent(req, {
      eventType: "order",
      action: `Deleted order ${ordId}`,
      targetModel: "Order",
      targetId: id,
      oldValues: deletedOrder.toObject(),
      metadata: { orderId: ordId },
    });
  }

  return res
    .status(200)
    .json({ message: "Order Successfully Deleted", deletedOrder });
});

const checkoutFromCart = catchAsync(async (req, res, next) => {
  const userId = req.userId; // from auth middleware
  const {
    address,
    contactNumber,
    paymentMethod,
    deliveryMethod,
    thirdPartyDelivery,
    proofOfPayment,
    rating,
    proofOfPaymentImage,
    referenceNumber,
  } = req.body;

  if (!paymentMethod) {
    return next(new AppError("Payment method is required", 400));
  }

  // 1. Get user's cart
  const userCart = await UserCart.findOne({ userId }).populate({
    path: "items.productId",
    // Need lensOptions to compute add-on price correctly
    select: "price name lensOptions",
  });

  if (!userCart || userCart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // 2. Map cart items into Order's product format
  const products = userCart.items.map((item) => {
    const lensPrice =
      item.productId.lensOptions?.find(
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

  // Basic validation between delivery fields
  if (
    typeof deliveryMethod !== "undefined" &&
    deliveryMethod === "Third-Party Delivery" &&
    !thirdPartyDelivery
  ) {
    return next(
      new AppError(
        "thirdPartyDelivery is required when deliveryMethod is 'Third-Party Delivery'",
        400
      )
    );
  }

  // 4. Create order
  // Generate friendly orderId
  let orderId;
  try {
    orderId = await generateOrderId();
  } catch (e) {
    return next(new AppError("Could not generate order id", 500));
  }

  const newOrder = new Order({
    orderId,
    customer: userId,
    products,
    date: new Date(),
    address,
    contactNumber,
    totalAmount,
    paymentMethod,
    status: "pending",
    deliveryMethod,
    ...(thirdPartyDelivery ? { thirdPartyDelivery } : {}),
    ...(proofOfPayment ? { proofOfPayment } : {}),
    ...(rating ? { rating } : {}),
  });

  await newOrder.save();

  // If a proof image URL and reference are provided (e.g., GCASH), create POP and attach
  if (proofOfPaymentImage && referenceNumber) {
    try {
      const pop = await ProofOfPayment.create({
        userId: userId,
        orderId: newOrder._id,
        proofOfPaymentImage: proofOfPaymentImage,
        referenceNumber: referenceNumber,
      });
      newOrder.proofOfPayment = pop._id;
      await newOrder.save();
    } catch (err) {
      // Do not fail the entire checkout; log and proceed
      console.error("Failed to attach proof of payment during checkout:", err);
    }
  }

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
