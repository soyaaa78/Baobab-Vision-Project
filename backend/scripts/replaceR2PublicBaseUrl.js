require("dotenv").config();

const mongoose = require("mongoose");

const Product = require("../models/Products");
const SlideshowImage = require("../models/SlideshowImage");
const User = require("../models/User");
const ProofOfPayment = require("../models/Order/ProofOfPayment");
const Rating = require("../models/Order/Rating");

const DEFAULT_BAD_BASE = process.env.R2_ENDPOINT || process.env.R2_PUBLIC_BASE_URL || "";
const NEW_BASE = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
const OLD_BASE = (process.env.R2_OLD_PUBLIC_BASE_URL || DEFAULT_BAD_BASE).replace(/\/+$/, "");
const APPLY = process.argv.includes("--apply");

const replaceBase = (value) => {
  if (typeof value !== "string" || !value.startsWith(`${OLD_BASE}/`)) return value;
  return `${NEW_BASE}/${value.slice(OLD_BASE.length).replace(/^\/+/, "")}`;
};

const escapedOldBase = () => OLD_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const recordChange = async (changes, label, doc, before, after) => {
  if (JSON.stringify(before) === JSON.stringify(after)) return;

  changes.push({
    collection: label,
    id: doc._id.toString(),
    name: doc.name || doc.email || undefined,
    before,
    after,
  });

  if (APPLY) await doc.save();
};

const updateProductUrls = async () => {
  const products = await Product.find({
    $or: [
      { imageUrls: { $elemMatch: { $regex: escapedOldBase() } } },
      { "colorOptions.imageUrl": { $regex: escapedOldBase() } },
      { "colorOptions.model3dUrl": { $regex: escapedOldBase() } },
      { model3dUrl: { $regex: escapedOldBase() } },
    ],
  });

  const changes = [];

  for (const product of products) {
    const before = {
      imageUrls: product.imageUrls,
      model3dUrl: product.model3dUrl,
      colorOptions: product.colorOptions.map((option) => ({
        imageUrl: option.imageUrl,
        model3dUrl: option.model3dUrl,
      })),
    };

    product.imageUrls = (product.imageUrls || []).map(replaceBase);
    product.model3dUrl = replaceBase(product.model3dUrl);
    product.colorOptions = product.colorOptions.map((option) => {
      option.imageUrl = replaceBase(option.imageUrl);
      option.model3dUrl = replaceBase(option.model3dUrl);
      return option;
    });

    const after = {
      imageUrls: product.imageUrls,
      model3dUrl: product.model3dUrl,
      colorOptions: product.colorOptions.map((option) => ({
        imageUrl: option.imageUrl,
        model3dUrl: option.model3dUrl,
      })),
    };

    await recordChange(changes, "products", product, before, after);
  }

  return changes;
};

const updateSimpleUrlField = async (Model, collection, fieldName) => {
  const docs = await Model.find({ [fieldName]: { $regex: escapedOldBase() } });
  const changes = [];

  for (const doc of docs) {
    const before = { [fieldName]: doc[fieldName] };
    doc[fieldName] = replaceBase(doc[fieldName]);
    const after = { [fieldName]: doc[fieldName] };
    await recordChange(changes, collection, doc, before, after);
  }

  return changes;
};

const updateArrayUrlField = async (Model, collection, fieldName) => {
  const docs = await Model.find({
    [fieldName]: { $elemMatch: { $regex: escapedOldBase() } },
  });
  const changes = [];

  for (const doc of docs) {
    const before = { [fieldName]: doc[fieldName] };
    doc[fieldName] = (doc[fieldName] || []).map(replaceBase);
    const after = { [fieldName]: doc[fieldName] };
    await recordChange(changes, collection, doc, before, after);
  }

  return changes;
};

const main = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (!OLD_BASE) throw new Error("R2_OLD_PUBLIC_BASE_URL or R2_ENDPOINT is required");
  if (!NEW_BASE) throw new Error("R2_PUBLIC_BASE_URL is required");
  if (OLD_BASE === NEW_BASE) throw new Error("Old and new public base URLs are identical");
  if (NEW_BASE.includes(".r2.cloudflarestorage.com")) {
    throw new Error("R2_PUBLIC_BASE_URL must be public, not .r2.cloudflarestorage.com");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const changes = [
    ...(await updateProductUrls()),
    ...(await updateSimpleUrlField(SlideshowImage, "slideshowimages", "imagePath")),
    ...(await updateSimpleUrlField(User, "users", "profileImage")),
    ...(await updateSimpleUrlField(
      ProofOfPayment,
      "proofofpayments",
      "proofOfPaymentImage"
    )),
    ...(await updateArrayUrlField(Rating, "ratings", "pictures")),
  ];
  await mongoose.disconnect();

  console.log(
    JSON.stringify(
      {
        apply: APPLY,
        oldBase: OLD_BASE,
        newBase: NEW_BASE,
        changedRecords: changes.length,
        changes,
      },
      null,
      2
    )
  );
};

main().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch (_err) {}
  process.exit(1);
});
