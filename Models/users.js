const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

require("dotenv").config(); // if not already in app.js
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB error:", err));

const userSchema = mongoose.Schema({
  username:{
    type: String,
  },
  password: {
    type: String,
    
  },
  name: {
    type: String
  },
  email: {
    type: String,
  },
  profileImage:{
    type: String,
  },
  bannerImage:{
    type: String,
  },
  contact:{
    type: Number,
  },
  boards:{
    type: Array,
    default: []
  },
  posts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  likedPosts: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }]


});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);