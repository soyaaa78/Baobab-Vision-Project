#!/usr/bin/env node
require("dotenv").config();
const mongoose = require("mongoose");

const FIREBASE_HOST_PATTERN = "firebasestorage.googleapis.com";
const FIREBASE_REGEX = new RegExp(FIREBASE_HOST_PATTERN, "i");

const requireEnv = (name) => {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const run = async () => {
  const mongoUri = requireEnv("MONGO_URI");
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  const counts = {};

  counts.products = await db.collection("products").countDocuments({
    $or: [
      { imageUrls: { $elemMatch: { $regex: FIREBASE_REGEX } } },
      { colorwayImageUrls: { $elemMatch: { $regex: FIREBASE_REGEX } } },
      { model3dUrl: { $regex: FIREBASE_REGEX } },
      { "colorOptions.imageUrl": { $regex: FIREBASE_REGEX } },
      { "colorOptions.model3dUrl": { $regex: FIREBASE_REGEX } },
    ],
  });

  counts.users = await db.collection("users").countDocuments({
    profileImage: { $regex: FIREBASE_REGEX },
  });

  counts.slideshowimages = await db.collection("slideshowimages").countDocuments({
    imagePath: { $regex: FIREBASE_REGEX },
  });

  counts.proofofpayments = await db.collection("proofofpayments").countDocuments({
    proofOfPaymentImage: { $regex: FIREBASE_REGEX },
  });

  counts.ratings = await db.collection("ratings").countDocuments({
    pictures: { $elemMatch: { $regex: FIREBASE_REGEX } },
  });

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  console.log(
    JSON.stringify(
      {
        pattern: FIREBASE_HOST_PATTERN,
        counts,
        total,
        pass: total === 0,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
  process.exit(total === 0 ? 0 : 2);
};

run().catch(async (error) => {
  console.error(error.message || error);
  try {
    await mongoose.disconnect();
  } catch (_err) {
    // ignore disconnect errors in failure path
  }
  process.exit(1);
});
