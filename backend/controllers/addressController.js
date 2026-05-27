const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Address = require("../models/Order/Address");

// GET Address by id, userId, or orderId (or all with index)
const address_get = catchAsync(async (req, res, next) => {
  const { id, userId, orderId, index } = req.query;

  if (!id && !userId && !orderId && !index) {
    return next(new AppError("Address identifier not found", 400));
  }

  let result;
  if (id) {
    result = await Address.findById(id)
      .populate("userId", "-password")
      .populate("orderId");
  } else if (userId) {
    result = await Address.find({ userId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (orderId) {
    result = await Address.find({ orderId })
      .populate("userId", "-password")
      .populate("orderId");
  } else if (index) {
    result = await Address.find()
      .populate("userId", "-password")
      .populate("orderId");
  }

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return next(new AppError("Address not found.", 404));
  }

  return res
    .status(200)
    .json({ message: "Address(es) Successfully Fetched", address: result });
});

// CREATE Address
const address_post = catchAsync(async (req, res, next) => {
  const {
    userId,
    orderId,
    fullName,
    contactNumber,
    region,
    province,
    city,
    barangay,
    postalCode,
    addressDetails,
  } = req.body;

  if (
    !userId ||
    !orderId ||
    !fullName ||
    !contactNumber ||
    !region ||
    !province ||
    !city ||
    !barangay ||
    !postalCode ||
    !addressDetails
  ) {
    return next(new AppError("Missing required address fields", 400));
  }

  const created = await Address.create({
    userId,
    orderId,
    fullName,
    contactNumber,
    region,
    province,
    city,
    barangay,
    postalCode,
    addressDetails,
  });

  return res
    .status(201)
    .json({ message: "Address Successfully Created", address: created });
});

// UPDATE Address
const address_patch = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Address identifier not found", 400));

  const updates = {};
  const fields = [
    "userId",
    "orderId",
    "fullName",
    "contactNumber",
    "region",
    "province",
    "city",
    "barangay",
    "postalCode",
    "addressDetails",
  ];
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key))
      updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0)
    return next(new AppError("No data to update", 400));

  const updated = await Address.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!updated) return next(new AppError("Address not found", 404));

  return res
    .status(200)
    .json({ message: "Address Updated Successfully", address: updated });
});

// DELETE Address
const address_delete = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new AppError("Address identifier not found", 400));

  const deleted = await Address.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Address not found", 404));

  return res
    .status(200)
    .json({ message: "Address Successfully Deleted", address: deleted });
});

module.exports = { address_get, address_post, address_patch, address_delete };
