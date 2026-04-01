const mongoose = require("mongoose");

const productViewStatSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

productViewStatSchema.index({ productId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("ProductViewStat", productViewStatSchema);
