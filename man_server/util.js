var util = {};

util.parseError = (errors) => {
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
    parsed.username = { message:"This username already exists!" };
  } else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}

util.getDate = (dateObj) => {
  if(dateObj instanceof Date)
    return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth()+1)+ "-" + get2digits(dateObj.getDate());
}

util.getTime = (dateObj) => {
  if(dateObj instanceof Date)
    return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
}

/* 모든 route에서 공용으로 사용될 isLoggedin, noPermission함수 */
// isLoggedin은 사용자가 로그인이 되었는지 아닌지를 판단.
// route에서 callback으로 사용될 함수이므로req, res, next를 받는다.
util.isLoggedin = (req, res, next) => {
  if (req.isAuthenticated()) { // 로그인이 된 상태라면
    next(); // 다음 callback함수를 호출
  } 
  else { // 로그인이 안된 상태라면 
    req.flash("errors", {login:"Please login first"});
    res.redirect("/login"); // 로그인 페이지로 redirect.
  }
}

// 어떠한 route에 접근권한이 없다고 판단된 경우에 호출되어 에러 메세지 전달.
// callback은 사용하지 않음.
util.noPermission = (req, res) => {
  req.flash("errors", {login:"You don't have permission"});
  req.logout();
  res.redirect("/login");
}

module.exports = util;

// private functions
 function get2digits(num) {
  return ("0" + num).slice(-2);
}
