// Model to store recommendation statistics for analytics
const mongoose = require("mongoose");

const recommendationStatSchema = new mongoose.Schema({
  faceShape: { type: String, required: true },
  lifestyleActivity: { type: String },
  uvProtectionImportance: { type: String },
  personalStyle: { type: String },
  fitPreference: { type: String },
  occasionUse: { type: String },
  colorPreference: { type: String },
  recommendedProductIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RecommendationStat", recommendationStatSchema);