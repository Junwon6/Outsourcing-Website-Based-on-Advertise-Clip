const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

// Home
router.get("/", (req, res) => {
    res.render("home/index");
});
router.get("/about", (req, res) => {
    res.render("home/about");
});

// Login
// login view를 보여주는 route.
router.get("/login", (req, res) => {
    const username = req.flash("username")[0];
    const errors = req.flash("errors")[0] || {};
    res.render("home/login", {
        username: username,
        errors: errors
    });
});

// Post Login
// login form에서 보내진 post request를 처리해 주는 route.
router.post("/login",
    // 보내진 form의 validation을 위한 것으로 에러가 있으면 flash를 만들고 login view로 redirect.
    (req, res, next) => {
        const errors = {};
        const isValid = true;

        if (!req.body.username) {
            isValid = false;
            errors.username = "Username is required!";
        }
        if (!req.body.password) {
            isValid = false;
            errors.password = "Password is required!";
        }

        if (isValid) {
            next();
        } else {
            req.flash("errors", errors);
            res.redirect("/login");
        }
    },
    // passport local strategy를 호출해서 authentication(로그인) 을 진행
    passport.authenticate("local-login", {
        successRedirect: "/posts",
        failureRedirect: "/login"
    }));

// Logout을 해주는 route입니다. 
// passport에서 제공된 req.logout 함수를 사용하여 로그아웃하고 "/"로 redirect.
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

module.exports = router;
