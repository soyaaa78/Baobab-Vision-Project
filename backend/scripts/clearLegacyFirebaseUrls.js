#!/usr/bin/env node
require("dotenv").config();
const mongoose = require("mongoose");

const FIREBASE_HOST_PATTERN = "firebasestorage.googleapis.com";
const FIREBASE_REGEX = new RegExp(FIREBASE_HOST_PATTERN, "i");
const REPLACEMENT_URL = "assets/models/sample/glass-center.png";

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

  console.log(`Starting cleanup: replacing ${FIREBASE_HOST_PATTERN} with ${REPLACEMENT_URL}...`);

  // Helper function to replace string in array
  const replaceInArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.map(item => typeof item === 'string' && FIREBASE_REGEX.test(item) ? REPLACEMENT_URL : item);
  };

  // 1. Products
  const productsCursor = db.collection("products").find({
    $or: [
      { imageUrls: { $elemMatch: { $regex: FIREBASE_REGEX } } },
      { colorwayImageUrls: { $elemMatch: { $regex: FIREBASE_REGEX } } },
      { model3dUrl: { $regex: FIREBASE_REGEX } },
      { "colorOptions.imageUrl": { $regex: FIREBASE_REGEX } },
      { "colorOptions.model3dUrl": { $regex: FIREBASE_REGEX } },
    ],
  });

  let productUpdates = 0;
  for await (const product of productsCursor) {
    let modified = false;

    if (product.imageUrls && product.imageUrls.some(u => FIREBASE_REGEX.test(u))) {
      product.imageUrls = replaceInArray(product.imageUrls);
      modified = true;
    }
    if (product.colorwayImageUrls && product.colorwayImageUrls.some(u => FIREBASE_REGEX.test(u))) {
      product.colorwayImageUrls = replaceInArray(product.colorwayImageUrls);
      modified = true;
    }
    if (typeof product.model3dUrl === 'string' && FIREBASE_REGEX.test(product.model3dUrl)) {
      product.model3dUrl = REPLACEMENT_URL;
      modified = true;
    }
    
    if (Array.isArray(product.colorOptions)) {
      for (let i = 0; i < product.colorOptions.length; i++) {
        let opt = product.colorOptions[i];
        if (typeof opt.imageUrl === 'string' && FIREBASE_REGEX.test(opt.imageUrl)) {
          opt.imageUrl = REPLACEMENT_URL;
          modified = true;
        }
        if (typeof opt.model3dUrl === 'string' && FIREBASE_REGEX.test(opt.model3dUrl)) {
          opt.model3dUrl = REPLACEMENT_URL;
          modified = true;
        }
      }
    }

    if (modified) {
      await db.collection("products").updateOne({ _id: product._id }, { $set: product });
      productUpdates++;
    }
  }
  console.log(`Updated ${productUpdates} products.`);

  // 2. Users
  const userResult = await db.collection("users").updateMany(
    { profileImage: { $regex: FIREBASE_REGEX } },
    { $set: { profileImage: REPLACEMENT_URL } }
  );
  console.log(`Updated ${userResult.modifiedCount} users.`);

  // 3. Slideshow Images
  const slideshowResult = await db.collection("slideshowimages").updateMany(
    { imagePath: { $regex: FIREBASE_REGEX } },
    { $set: { imagePath: REPLACEMENT_URL } }
  );
  console.log(`Updated ${slideshowResult.modifiedCount} slideshow images.`);

  // 4. Proof of Payments
  const popResult = await db.collection("proofofpayments").updateMany(
    { proofOfPaymentImage: { $regex: FIREBASE_REGEX } },
    { $set: { proofOfPaymentImage: REPLACEMENT_URL } }
  );
  console.log(`Updated ${popResult.modifiedCount} proof of payments.`);

  // 5. Ratings
  const ratingsCursor = db.collection("ratings").find({
    pictures: { $elemMatch: { $regex: FIREBASE_REGEX } },
  });
  let ratingUpdates = 0;
  for await (const rating of ratingsCursor) {
    if (rating.pictures && rating.pictures.some(u => FIREBASE_REGEX.test(u))) {
      await db.collection("ratings").updateOne(
        { _id: rating._id },
        { $set: { pictures: replaceInArray(rating.pictures) } }
      );
      ratingUpdates++;
    }
  }
  console.log(`Updated ${ratingUpdates} ratings.`);

  console.log("Cleanup complete!");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (error) => {
  console.error("Script failed:", error);
  try {
    await mongoose.disconnect();
  } catch (_err) {}
  process.exit(1);
});
