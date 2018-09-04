const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const util = require("../util");

// Index
// populate => relationship이 형성되어 있는 항목의 값 생성.
// 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성
router.get("/", (req, res) => {
    Post.find({})
        .populate("author")
        .sort("-createdAt")
        .exec((err, posts) => {
            if (err) return res.json(err);
            res.render("posts/index", {
                posts: posts
            });
        });
});

// New
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.get("/new", util.isLoggedin, (req, res) => {
    const post = req.flash("post")[0] || {};
    const errors = req.flash("errors")[0] || {};
    res.render("posts/new", {
        post: post,
        errors: errors
    });
});

// create
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.post("/", util.isLoggedin, (req, res) => {
    req.body.author = req.user._id; // 글을 작성할때는 req.user._id를 가져와서 post의 author에 기록
    Post.create(req.body, (err, post) => {
        if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new");
        }
        res.redirect("/posts");
    });
});

// show
router.get("/:id", (req, res) => {
    Post.findOne({
            _id: req.params.id
        })
        .populate("author")
        .exec((err, post) => {
            if (err) return res.json(err);
            res.render("posts/show", {
                post: post
            });
        });
});

// edit
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
// checkPermission를 사용해서 본인이 작성한 글에만 다음 callback을 호출
router.get("/:id/edit", util.isLoggedin, checkPermission, (req, res) => {
    const post = req.flash("post")[0];
    const errors = req.flash("errors")[0] || {};
    if (!post) {
        Post.findOne({
            _id: req.params.id
        }, (err, post) => {
            if (err) return res.json(err);
            res.render("posts/edit", {
                post: post,
                errors: errors
            });
        });
    } else {
        post._id = req.params.id;
        res.render("posts/edit", {
            post: post,
            errors: errors
        });
    }
});

// update
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
// checkPermission를 사용해서 본인이 작성한 글에만 다음 callback을 호출
router.put("/:id", util.isLoggedin, checkPermission, (req, res) => {
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        runValidators: true // findOneAndUpdate는 기본설정이 schema에 있는 validation을 작동하지 않도록 되어 있기때문에 이 option을 통해서 validation이 작동하도록 설정해 주어야함.
    }, (err, post) => {
        if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/" + req.params.id + "/edit");
        }
        res.redirect("/posts/" + req.params.id);
    });
});

// destroy
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.delete("/:id", util.isLoggedin, checkPermission, (req, res) => {
    Post.remove({
        _id: req.params.id
    }, (err) => {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

module.exports = router;

// private functions
// 해당 게시물에 기록된 author와 로그인된 user.id를 비교해서 같은 경우 통과.
// 만약 다르다면 util.noPermission함수를 호출.
function checkPermission(req, res, next) {
    Post.findOne({
        _id: req.params.id
    }, (err, post) => {
        if (err) 
            return res.json(err);
        if (post.author != req.user.id) 
            return util.noPermission(req, res);
        next();
    });
}
