const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId ,
    ref:"user"
  },
  title: {
    type: String,
    
  },
  description: {
    type: String
  },
  image: String,
  Date:{
    type:Date,
    default:Date.now,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }]


});



module.exports = mongoose.model("post", postSchema);