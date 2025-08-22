const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Rating = require("../models/Order/Rating");

// GET Rating
const rating_get = catchAsync(async (req, res, next) => {
  const { id, userId, orderId, index } = req.query;
  if (!id && !userId && !orderId && !index)
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
    result = await Rating.find()
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

  const payload = { userId, orderId, rating, comment };
  if (typeof pictures !== "undefined") {
    payload.pictures = Array.isArray(pictures) ? pictures : [pictures];
  }

  const created = await Rating.create(payload);
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

  const deleted = await Rating.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Rating not found", 404));

  return res
    .status(200)
    .json({ message: "Rating Successfully Deleted", rating: deleted });
});

module.exports = { rating_get, rating_post, rating_patch, rating_delete };
