const User = require('../models/User');

// Get user profile (excluding sensitive info)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (including profileImage upload)
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { firstname, lastname, email, username, phone, address } = req.body;

    const updateData = { firstname, lastname, email, username, phone, address };

    if (req.file) {
        updateData.profileImage = `/userprofileuploads/${req.file.filename}`;
      }
      

    // Remove undefined keys (in case fields were not sent)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true }
    ).select('-password -otp -otpExpiry');

    res.json(updatedUser);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };
