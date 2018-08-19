const mongoose = require("mongoose");
const bcrypt   = require("bcrypt-nodejs");

// schema
// schema에서 match: [/정규표현식/,"에러메세지"]를 사용하면
// 해당 표현식에 맞지 않는 값이 오는 경우 에러메세지를 보냄.
const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,"Username is required!"],
    match:[/^.{4,12}$/,"Should be 4-12 characters!"],
    trim: true, // trim은 문자열 앞뒤에 빈칸이 있는 경우 빈칸을 제거해 주는 옵션
    unique:true
  },
  password:{
    type:String,
    required:[true,"Password is required!"],
    select:false
  },
  name:{
    type:String,
    required:[true,"Name is required!"],
    match:[/^.{4,12}$/,"Should be 4-12 characters!"],
    trim:true
  },
  phonenum: {
    type: String,
    required: [true, "PhoneNum is required!"],
    match: [/^\d{3}-\d{3,4}-\d{4}$/, "Should be a vaild Phone Number!"],
    trim: true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Should be a vaild email address!"],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual("passwordConfirmation")
.get(() => {
   return this._passwordConfirmation; 
})
.set((value) => {
  this._passwordConfirmation = value;
});

userSchema.virtual("originalPassword")
.get(() => {
  return this._originalPassword;
})
.set((value) => {
  this._originalPassword = value;
});

userSchema.virtual("currentPassword")
.get(() => {
  return this._currentPassword;
})
.set((value) => {
  this._currentPassword = value;
});

userSchema.virtual("newPassword")
.get(() => {
  return this._newPassword;
})
.set((value) => {
  this._newPassword = value;
});

// password validation
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!";
userSchema.path("password").validate((v) => {
  const user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate("passwordConfirmation", "Password Confirmation is required!");
    }
    if(!passwordRegex.test(user.password)){
      user.invalidate("password", passwordRegexErrorMessage);
    } else if(user.password !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate("currentPassword", "Current Password is required!");
    }
    if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate("currentPassword", "Current Password is invalid!");
    }
    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    } else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
    }
  }
});

// hash password
userSchema.pre("save", (next) => {
  const user = this;
  if(!user.isModified("password")){
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = (password) => {
  const user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
const User = mongoose.model("user",userSchema);
module.exports = User;
