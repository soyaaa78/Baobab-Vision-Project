// Model to store recommendation statistics for analytics
const mongoose = require("mongoose");

const recommendationStatSchema = new mongoose.Schema({
  faceShape: { type: String, required: true },
  lifestyle: { type: String },
  occasion: { type: String },
  eyeglassStyle: { type: String },
  recommendedProductIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RecommendationStat", recommendationStatSchema);
