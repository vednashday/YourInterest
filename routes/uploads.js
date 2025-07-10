const express = require("express");
const router = express.Router();
const upload = require("../uploadMiddleware");
const User = require("../Models/users"); // replace with your actual user model path

// POST /upload/profile
router.post("/profile", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    // Make sure user is logged in
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Update the user profile with the image URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      message: "Profile image updated",
      profileImage: imageUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});


module.exports = router; 