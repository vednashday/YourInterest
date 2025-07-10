const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("./cloudinaryConfig");
require("dotenv").config();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

module.exports = upload;
