const mongoose = require("mongoose");

const SlideshowImageSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SlideshowImage", SlideshowImageSchema);
