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
    res.render("users/index", { 
      users 
    });
  });
});

// New
// user 생성시에 에러가 있는 경우 new페이지에 에러와 기존에 입력했던 값들을 보여줌.
// 이 값들은 flash에서 받아온다. 
// flash는 array가 오게 되는데 이 프로그램에서는 하나 이상의 값이 저장되는 경우가 없고, 있더라도 오류이므로 무조건 [0]의 값을 읽어온다.
router.get("/new", (req, res) => {
  const user = req.flash("user")[0] || {}; // req.flash(문자열) 인 경우 해당 문자열에 저장된 값들을 배열을 불러옴.
  const errors = req.flash("errors")[0] || {};
  res.render("users/new", { 
    user,
    errors 
  }); 
});

// create
// user 생성시에 오류가 있다면 user, error flash를 만들고 new페이지로 redirect.
router.post("/", (req, res) => {
  User.create(req.body, (err, user) => {
    if(err){
      req.flash("user", req.body); // req.flash(문자열, 저장할_값) 의 형태로 저장할_값(숫자, 문자열, 오브젝트등 어떠한 값이라도 가능)을 해당 문자열에 저장.
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
    res.render("users/show", { user });
  });
});

// edit
// 처음 접속하는 경우에는 DB에서 값을 찾아 form에 기본값을 생성.
// update에서 오류가 발생해 돌아오는 경우에는 기존에 입력했던 값으로 form에 값들을 생성.
// user flash값이 있으면 오류가 있는 경우, user flash 값이 없으면 처음 들어온 경우로 가정.
router.get("/:username/edit", util.isLoggedin, checkPermission, (req, res) => {
  const user = req.flash("user")[0]; // 기존에 입력했던 값으로 생성해야 하기 때문에 || {}을 사용 X.
  const errors = req.flash("errors")[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, (err, user) => {
      if(err) return res.json(err);
      res.render("users/edit", {
        username: req.params.username,
        user,
        errors
      }); // 주소에서 찾은 username을 따로 보내준다.
    });
  } else {
    res.render("users/edit", {
      username: req.params.username,
      user,
      errors
    }); 
  }
});

// update
router.put("/:username", util.isLoggedin, checkPermission, (req, res, next) => {
  User.findOne({ username:req.params.username })
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
