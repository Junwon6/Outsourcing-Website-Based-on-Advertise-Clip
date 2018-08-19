const express  = require("express");
const router   = express.Router();
const User     = require("../models/User");
const util     = require("../util");

// Index
router.get("/", util.isLoggedin, (req, res) => {
  User.find({})
  .sort({username:1})
  .exec((err, users) => {
    if(err) return res.json(err);
    res.render("users/index", {users:users});
  });
});

// New
router.get("/new", (req, res) => {
  const user = req.flash("user")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("users/new", { user:user, errors:errors });
});

// create
router.post("/", (req, res) => {
  User.create(req.body, (err, user) => {
    if(err){
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/users/new");
    }
    res.redirect("/users");
  });
});

// show
router.get("/:username", util.isLoggedin, (req, res) => {
  User.findOne({username:req.params.username}, (err, user) => {
    if(err) return res.json(err);
    res.render("users/show", {user:user});
  });
});

// edit
router.get("/:username/edit", util.isLoggedin, checkPermission, (req, res) => {
  const user = req.flash("user")[0];
  const errors = req.flash("errors")[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render("users/edit", { username:req.params.username, user:user, errors:errors });
    });
  } else {
    res.render("users/edit", { username:req.params.username, user:user, errors:errors });
  }
});

// update
router.put("/:username", util.isLoggedin, checkPermission, (req, res, next) => {
  User.findOne({username:req.params.username})
  .select({password:1})
  .exec((err, user) => {
    if(err) return res.json(err);

    // update user object
    user.originalPassword = user.password;
    user.password = req.body.newPassword? req.body.newPassword : user.password;
    for(const p in req.body){
      user[p] = req.body[p];
    }

    // save updated user
    user.save((err, user) => {
      if(err){
        req.flash("user", req.body);
        req.flash("errors", util.parseError(err));
        return res.redirect("/users/"+req.params.username+"/edit");
      }
      res.redirect("/users/"+user.username);
    });
  });
});

module.exports = router;

// private functions
// 해당 user의 id와 로그인된 user.id를 비교해서 같은 경우 통과.
// 만약 다르다면 util.noPermission함수를 호출.
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, (err, user) => {
    if(err) 
      return res.json(err);
    if(user.id != req.user.id) 
      return util.noPermission(req, res);
    next();
  });
}
