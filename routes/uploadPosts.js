
const express = require("express");
const router = express.Router();
const upload = require("../uploadMiddleware"); // Cloudinary upload
const Post = require("../Models/posts");
const User = require("../Models/users");

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { title, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const newPost = await Post.create({
      user: req.user._id,
      title,
      description,
      image: imageUrl,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: newPost._id },
    });

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Post creation failed" });
  }
});

module.exports = router;
