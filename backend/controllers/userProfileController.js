const User = require("../models/User");
const { uploadSingleImageHelper } = require("./firebaseStorageController");

// Get user profile (excluding sensitive info)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password -otp -otpExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile (including profileImage upload to Firebase)
const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, email, username, phone, address } = req.body;
    const updateData = { firstname, lastname, email, username, phone, address };

    // If a file is uploaded, store it in Firebase Storage and use the download URL
    if (req.file) {
      try {
        // Use a dedicated folder for profile images
        const downloadUrl = await uploadSingleImageHelper(
          req.file,
          "userprofileuploads"
        );
        updateData.profileImage = downloadUrl;
      } catch (uploadErr) {
        console.error("Firebase profile image upload failed:", uploadErr);
        return res
          .status(500)
          .json({ message: "Failed to upload profile image" });
      }
    }

    // Remove undefined keys (in case fields were not sent)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select("-password -otp -otpExpiry");

    res.json(updatedUser);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile };
