const mongoose = require('mongoose');

const SlideshowImageSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SlideshowImage', SlideshowImageSchema);
