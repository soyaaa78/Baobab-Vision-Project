const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Rating = require("../models/Order/Rating");
const Order = require("../models/Order");
const Admin = require("../models/Admin");

// GET Rating
const rating_get = catchAsync(async (req, res, next) => {
  const { id, userId, orderId, index } = req.query;
  if (!id && !userId && !orderId && !index && !req.userId)
    return next(new AppError("Rating identifier not found", 400));

  let result;
  if (id) {
    result = await Rating.findById(id)
      .populate("userId", "-password")
      .populate("orderId");
  } else if (userId) {
    result = await Rating.find({ userId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (orderId) {
    result = await Rating.find({ orderId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (index) {
    // Index enables admins to list all ratings
    result = await Rating.find()
      .populate("userId", "-password")
      .populate("orderId");
  } else if (req.userId) {
    // Default to current user's ratings
    result = await Rating.find({ userId: req.userId })
      .populate("userId", "-password")
      .populate("orderId");
  }

  if (!result || (Array.isArray(result) && result.length === 0))
    return next(new AppError("Rating not found.", 404));

  return res
    .status(200)
    .json({ message: "Rating(s) Successfully Fetched", rating: result });
});

// CREATE Rating
const rating_post = catchAsync(async (req, res, next) => {
  const { userId, orderId, rating, comment, pictures } = req.body;
  if (!userId || !orderId || typeof rating === "undefined") {
    return next(new AppError("Missing required fields", 400));
  }

  // Ensure user matches authenticated user
  if (req.userId && userId !== req.userId.toString()) {
    return next(new AppError("Unauthorized rating user", 403));
  }

  // Prevent multiple ratings per order
  const existing = await Rating.findOne({ orderId });
  if (existing) {
    return next(new AppError("Order already rated", 409));
  }

  const payload = { userId, orderId, rating, comment };
  if (typeof pictures !== "undefined") {
    payload.pictures = Array.isArray(pictures) ? pictures : [pictures];
  }

  const created = await Rating.create(payload);

  // Link rating to Order document
  try {
    await Order.findByIdAndUpdate(orderId, { rating: created._id });
  } catch (e) {
    // Log and continue without failing response
    console.error("Failed to attach rating to order", e);
  }
  return res
    .status(201)
    .json({ message: "Rating Successfully Created", rating: created });
});

// UPDATE Rating
const rating_patch = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Rating identifier not found", 400));

  const updates = {};
  const fields = ["userId", "orderId", "rating", "comment"];
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key))
      updates[key] = req.body[key];
  }

  // Always store pictures as an array if provided
  if (Object.prototype.hasOwnProperty.call(req.body, "pictures")) {
    const pics = req.body.pictures;
    updates.pictures = Array.isArray(pics) ? pics : [pics];
  }

  // Admin response support
  if (Object.prototype.hasOwnProperty.call(req.body, "adminResponse")) {
    // Only allow admins/staff to set adminResponse. Basic check: presence of req.user from adminAuth or role from token.
    // If coming from user auth middleware, req.userId is set (user token). If coming from admin auth, req.user.role exists.
    const isAdminOrStaff =
      req.user?.role &&
      ["super_admin", "staff_product", "staff_order"].includes(req.user.role);
    if (!isAdminOrStaff) {
      return next(new AppError("Only staff can respond to ratings", 403));
    }
    updates.adminResponse = req.body.adminResponse;
    updates.respondedAt = new Date();
  }

  if (Object.keys(updates).length === 0)
    return next(new AppError("No data to update", 400));

  const updated = await Rating.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!updated) return next(new AppError("Rating not found", 404));

  return res
    .status(200)
    .json({ message: "Rating Updated Successfully", rating: updated });
});

// DELETE Rating
const rating_delete = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Rating identifier not found", 400));

  // Find rating to get the orderId for cleanup
  const ratingDoc = await Rating.findById(id);
  if (!ratingDoc) return next(new AppError("Rating not found", 404));

  const deleted = await Rating.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Rating not found", 404));

  // Remove reference from Order if it points to this rating
  if (ratingDoc.orderId) {
    try {
      await Order.updateOne(
        { _id: ratingDoc.orderId, rating: ratingDoc._id },
        { $unset: { rating: "" } }
      );
    } catch (e) {
      console.error("Failed to remove rating reference from order", e);
    }
  }

  return res
    .status(200)
    .json({ message: "Rating Successfully Deleted", rating: deleted });
});

module.exports = { rating_get, rating_post, rating_patch, rating_delete };
