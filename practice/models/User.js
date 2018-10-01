var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// schema
// schema에서 match: [/정규표현식/,"에러메세지"]를 사용하면
// 해당 표현식에 맞지 않는 값이 오는 경우 에러메세지를 보냄.
var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    match: [/^.{4,12}$/, "Should be 4-12 characters!"],
    trim: true, // trim은 문자열 앞뒤에 빈칸이 있는 경우 빈칸을 제거해 주는 옵션
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    select: false
  },
  name: {
    type: String,
    required: [true, "Name is required!"],
    match: [/^.{4,12}$/, "Should be 4-12 characters!"],
    trim: true
  },
  email: {
    type: String,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
    trim: true
  },
  phone_num: {
    type: String,
    match: [/^\d{3}\d{3,4}\d{4}$/, "Should be a vaild phone num! ex) 01012345678"],
    require: [true, "PhoneNum is required!"]
  },
}, 
{
  toObject: {
    virtuals: true
  }
});

// virtuals
userSchema.virtual("passwordConfirmation")
  .get(function () {
    return this._passwordConfirmation;
  })
  .set(function (value) {
    this._passwordConfirmation = value;
  });

userSchema.virtual("originalPassword")
  .get(function () {
    return this._originalPassword;
  })
  .set(function (value) {
    this._originalPassword = value;
  });

userSchema.virtual("currentPassword")
  .get(function () {
    return this._currentPassword;
  })
  .set(function (value) {
    this._currentPassword = value;
  });

userSchema.virtual("newPassword")
  .get(function () {
    return this._newPassword;
  })
  .set(function (value) {
    this._newPassword = value;
  });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!";
userSchema.path("password").validate(function (v) {
  var user = this;

  // create user 회원가입의 경우
  if (user.isNew) {
    if (!user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation is required!");
    }
    if (!passwordRegex.test(user.password)) {
      user.invalidate("password", passwordRegexErrorMessage);
    } else if (user.password !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
    }
  }

  // update user 회원정보 수정의 경우
  if (!user.isNew) {
    if (!user.currentPassword) {
      user.invalidate("currentPassword", "Current Password is required!");
    }
    if (user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
      user.invalidate("currentPassword", "Current Password is invalid!");
    }
    if (user.newPassword && !passwordRegex.test(user.newPassword)) {
      user.invalidate("newPassword", passwordRegexErrorMessage);
    } else if (user.newPassword !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
    }
  }
});

// hash password
userSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) {
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
