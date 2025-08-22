const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const ProofOfPayment = require("../models/Order/ProofOfPayment");

// GET ProofOfPayment
const pop_get = catchAsync(async (req, res, next) => {
  const { id, userId, orderId, index } = req.query;
  if (!id && !userId && !orderId && !index)
    return next(new AppError("Identifier not found", 400));

  let result;
  if (id) {
    result = await ProofOfPayment.findById(id)
      .populate("userId", "-password")
      .populate("orderId");
  } else if (userId) {
    result = await ProofOfPayment.find({ userId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (orderId) {
    result = await ProofOfPayment.find({ orderId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (index) {
    result = await ProofOfPayment.find()
      .populate("userId", "-password")
      .populate("orderId");
  }

  if (!result || (Array.isArray(result) && result.length === 0))
    return next(new AppError("Proof of Payment not found.", 404));

  return res
    .status(200)
    .json({ message: "Proof(s) Successfully Fetched", proofOfPayment: result });
});

// CREATE ProofOfPayment
const pop_post = catchAsync(async (req, res, next) => {
  const { userId, orderId, proofOfPaymentImage, referenceNumber } = req.body;
  if (!userId || !orderId || !proofOfPaymentImage || !referenceNumber) {
    return next(new AppError("Missing required fields", 400));
  }

  const created = await ProofOfPayment.create({
    userId,
    orderId,
    proofOfPaymentImage,
    referenceNumber,
  });
  return res
    .status(201)
    .json({
      message: "Proof of Payment Successfully Created",
      proofOfPayment: created,
    });
});

// UPDATE ProofOfPayment
const pop_patch = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Identifier not found", 400));

  const updates = {};
  const fields = [
    "userId",
    "orderId",
    "proofOfPaymentImage",
    "referenceNumber",
  ];
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key))
      updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0)
    return next(new AppError("No data to update", 400));

  const updated = await ProofOfPayment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!updated) return next(new AppError("Proof of Payment not found", 404));

  return res
    .status(200)
    .json({
      message: "Proof of Payment Updated Successfully",
      proofOfPayment: updated,
    });
});

// DELETE ProofOfPayment
const pop_delete = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Identifier not found", 400));

  const deleted = await ProofOfPayment.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Proof of Payment not found", 404));

  return res
    .status(200)
    .json({
      message: "Proof of Payment Successfully Deleted",
      proofOfPayment: deleted,
    });
});

module.exports = { pop_get, pop_post, pop_patch, pop_delete };
