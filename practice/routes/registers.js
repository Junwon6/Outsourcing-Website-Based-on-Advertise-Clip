const express = require("express");
const router = express.Router();
const Register = require("../models/Register");
const util = require("../util");

// Index
// populate => relationship이 형성되어 있는 항목의 값 생성.
// 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성
router.get("/", (req, res) => {
    Register.find({})
        .sort("-createdAt")
        .exec((err, registers) => {
            if (err) return res.json(err);
            res.render("registers/index", {
                registers: registers
            });
        });
});

// New
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.get("/new", util.isLoggedin, (req, res) => {
    const register = req.flash("register")[0] || {};
    const errors = req.flash("errors")[0] || {};
    res.render("registers/new", {
        register: register,
        errors: errors
    });
});

// create
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.post("/", util.isLoggedin, (req, res) => {
    req.body.author = req.user._id; // 글을 작성할때는 req.user._id를 가져와서 post의 author에 기록
    Register.create(req.body, (err, register) => {
        if (err) {
            req.flash("register", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/registers/new");
        }
        res.redirect("/registers");
    });
});

// show
router.get("/:id", (req, res) => {
    Register.findOne({
            _id: req.params.id
        })
        .populate("author")
        .exec((err, register) => {
            if (err) return res.json(err);
            res.render("registers/show", {
                register: register
            });
        });
});

// edit
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
// checkPermission를 사용해서 본인이 작성한 글에만 다음 callback을 호출
router.get("/:id/edit", util.isLoggedin, checkPermission, (req, res) => {
    const register = req.flash("register")[0];
    const errors = req.flash("errors")[0] || {};
    if (!register) {
        Register.findOne({
            _id: req.params.id
        }, (err, register) => {
            if (err) return res.json(err);
            res.render("registers/edit", {
                register: register,
                errors: errors
            });
        });
    } else {
        register._id = req.params.id;
        res.render("registers/edit", {
            register: register,
            errors: errors
        });
    }
});

// update
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
// checkPermission를 사용해서 본인이 작성한 글에만 다음 callback을 호출
router.put("/:id", util.isLoggedin, checkPermission, (req, res) => {
    req.body.updatedAt = Date.now();
    Register.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        runValidators: true // findOneAndUpdate는 기본설정이 schema에 있는 validation을 작동하지 않도록 되어 있기때문에 이 option을 통해서 validation이 작동하도록 설정해 주어야함.
    }, (err, register) => {
        if (err) {
            req.flash("register", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/registers/" + req.params.id + "/edit");
        }
        res.redirect("/registers/" + req.params.id);
    });
});

// destroy
// util.isLoggedin를 사용해서 로그인이 된 경우에만 다음 callback을 호출
router.delete("/:id", util.isLoggedin, checkPermission, (req, res) => {
    Register.remove({
        _id: req.params.id
    }, (err) => {
        if (err) return res.json(err);
        res.redirect("/registers");
    });
});

module.exports = router;

// private functions
// 해당 게시물에 기록된 author와 로그인된 user.id를 비교해서 같은 경우 통과.
// 만약 다르다면 util.noPermission함수를 호출.
function checkPermission(req, res, next) {
    Register.findOne({
        _id: req.params.id
    }, (err, register) => {
        if (err)
            return res.json(err);
        if (register.author != req.user.id)
            return util.noPermission(req, res);
        next();
    });
}
