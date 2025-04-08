const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pin");

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