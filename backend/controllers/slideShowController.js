const SlideshowImage = require("../models/SlideshowImage");
const { uploadSingleImageHelper } = require("./firebaseStorageController");

// POST new image upload (to Firebase)
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload image to Firebase Storage
    const firebaseUrl = await uploadSingleImageHelper(
      req.file,
      "slideshow/images"
    );
    // Compute next position (append to end)
    const last = await SlideshowImage.findOne().sort({ position: -1 });
    const nextPosition = last ? last.position + 1 : 1;
    const newImage = new SlideshowImage({
      imagePath: firebaseUrl,
      position: nextPosition,
    });
    await newImage.save();
    res
      .status(201)
      .json({ message: "Image uploaded successfully", image: newImage });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image", error });
  }
};

// GET all images
const getAllImages = async (req, res) => {
  try {
    const images = await SlideshowImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images", error });
  }
};

// DELETE image by id (removes from Firebase and db record)
const {
  deleteImage: deleteFirebaseImage,
} = require("./firebaseStorageController");
const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await SlideshowImage.findById(id);
    if (!doc) return res.status(404).json({ message: "Image not found" });

    // Delete from Firebase Storage
    if (doc.imagePath) {
      // Use the Firebase controller to delete by URL
      await deleteFirebaseImage(
        { body: { imageUrl: doc.imagePath } },
        {
          status: () => ({ json: () => {} }),
        },
        () => {}
      );
    }

    await SlideshowImage.deleteOne({ _id: id });
    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
  deleteImage,
};
