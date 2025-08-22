const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    pictures: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Rating", RatingSchema);
