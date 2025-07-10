var express = require('express');
const passport = require('passport');
var router = express.Router();
const userModel = require('../Models/users');
const postModel = require("../Models/posts");
const localStrategy = require("passport-local");
const upload = require('../uploadMiddleware');



passport.use(new localStrategy(userModel.authenticate()));


router.post('/register', function(req,res){
  var userData = new userModel({
    email:req.body.email,
    username:req.body.username,
    name:req.body.fullname,
    contact:req.body.contact,
    likedPosts:[]
  })

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: '/',
  successRedirect: '/profile',
}),function(req,res,next){

});

router.get("/logout",function(req,res,next){
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{nav: false});
});
router.get('/login', function(req, res, next) {
  res.render('index',{nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav: false});
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username:req.session.passport.user})
        .populate("posts")
        .populate("likedPosts")
  res.render('profile', {user, nav: true});
});
router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.path; // ✅ Cloudinary URL
  await user.save();
  res.redirect('/profile');
});
router.post('/bannerupload', isLoggedIn, upload.single("bannerImage"), async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.bannerImage = req.file.path; // ✅ Cloudinary URL
  await user.save();
  res.redirect('/profile');
});


router.get('/add',isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  res.render('add', {user, nav: true});
});

router.post('/createpost', isLoggedIn, upload.single("image"), async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file?.path, // ✅ Cloudinary URL
    date: new Date(),
    likes: []
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});


router.get('/show/posts',isLoggedIn,async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username:req.session.passport.user})
        .populate("posts")
  res.render('show', {user, nav: true});
});

router.get('/show/liked-posts',isLoggedIn,async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username:req.session.passport.user})
        .populate("likedPosts")
  res.render('show-liked', {user, nav: true});
});
router.get('/feed',isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")
  res.render('feed', {user,posts, currentUser: user, nav: true});
});

router.get('/search', async (req, res) => {
  const query = req.query.q.trim();

  try {
    const users = await userModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('name username profileImage');

    res.render('search-results', { users, query, nav: true });
  } catch (err) {
    console.error(err);
    res.render('search-results', { users: [], query, nav: true });
  }
});

router.get('/user/:username', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
      .findOne({ username: req.params.username })
      .populate("posts");

    if (!user) return res.status(404).send("User not found");

    res.render("public-profile", { user, nav: true }); // Create this EJS file
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

router.get('/edit', isLoggedIn , async function(req,res){
  const user = await userModel.findOne({ username:req.session.passport.user });
  res.render('edit-profile', {user, nav:true});

});
router.post('/edit', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  user.name = req.body.name;
  user.username = req.body.username;
  user.email = req.body.email;
  user.contact = req.body.contact;

  await user.save();
  res.redirect('/profile');
});

router.get('/editpost/:id', isLoggedIn , async function(req,res){
  const post = await postModel.findById(req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.render('edit-posts', { post ,nav: true});

});
router.post('/editpost/:id', isLoggedIn, async function(req, res) {
  await postModel.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    description: req.body.description
  });
  
  res.redirect('/profile');
});

router.get('/deletepost/:id', isLoggedIn, async function(req, res) {
  try {
    const postId = req.params.id;

    // Remove post from user's posts array
    const user = await userModel.findOne({ username: req.session.passport.user });
    user.posts.pull(postId);
    await user.save();

    // Delete the post from the database
    await postModel.findByIdAndDelete(postId);

    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting post");
  }
});

router.post('/like/:id',isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    const userId = req.user._id; 
    const postId = post._id;
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
      user.likedPosts.pull(postId);
    } else {
      post.likes.push(userId); 
      user.likedPosts.push(postId);
    }
    await post.save();
    await user.save();
    

    

    res.status(200).json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
