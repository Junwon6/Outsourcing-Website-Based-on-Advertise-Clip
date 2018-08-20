const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User          = require("../models/User");

// serialize & deserialize User
// login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분.
// session에 저장되는 정보가 많아지면 성능이 떨어질 수 있고, user object가 변경되면 반영되지 못하므로 id만 저장.
passport.serializeUser((user, done) => {
  done(null, user.id); // done함수의 첫번째 parameter는 항상 error를 담기 위한 것으로 error가 없다면null을 담는다.
});
// request시에 session에서 어떻게 user object를 만들지를 정하는 부분.
// 매번 request마다 user정보를 db에서 새로 읽어옴.
// user가 변경되면 바로 변경된 정보가 반영되는 장점. 
// 다만 매번 request마다 db를 읽게 되는 단점. 선택은 그때 그때 상황에 맞게 하시면 됩니다.
passport.deserializeUser((id, done) => {
  User.findOne({_id:id}, (err, user) => {
    done(err, user);
  });
});

// local strategy
// local strategy을 설정하는 부분.
// 여기서는 해당 항목 이름이 form과 일치하기 때문에 굳이 사용 X됨.
// 민약 로그인 form의 항목이름이 email, pass라면 usernameField : "email", passwordField : "pass"로 해야함.
passport.use("local-login",
  new LocalStrategy({
      usernameField : "username",
      passwordField : "password",
      passReqToCallback : true
    },
    // 로그인 시 이 함수가 호출됨.
    // DB에서 해당 user를 찾고, user model에 설정했던 user.authenticate 함수를 사용해서 입력받은 password와 저장된 password hash를 비교해서 값이 일치하면 
    // 해당 user를 done에 담아서 return하고 (return done(null, user);), 
    // 그렇지 않은 경우 username flash와 에러 flash를 생성한 후 done에 false를 담아 return합니다.(return done(null, false);) 
    // user가 전달되지 않으면 local-strategy는 실패(failure)로 간주.
    (req, username, password, done) => {
      User.findOne({username:username})
      .select({password:1})
      .exec((err, user) => {
        if (err) return done(err);
        // user.authenticate(password)는 입력받은 password와 db에서 읽어온 해당 user의 password hash를 비교하는 함수.
        if (user && user.authenticate(password)){
          return done(null, user);
        } else {
          req.flash("username", username);
          req.flash("errors", {login:"Incorrect username or password"});
          return done(null, false);
        }
      });
    }
  )
);

module.exports = passport;
