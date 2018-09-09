var mongoose = require("mongoose");
var util = require("../util");

// schema
// DB schema // schema object 생성
var companySchema = mongoose.Schema({
    company_name: {
        type: String,
        required: true
    },
    introduction: {
        type: String,
        required: true
    },
    email: {
        type: String,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
        trim: true
    },
    homepage: {
        type: String,
    },
}, {
    toObject: {
        virtuals: true
    }
});

// model & export
/* 함수인자의 첫번째 DB에서 사용될 document의 이름, 두번째는 생선된 object */
var Company = mongoose.model("company", companySchema);
module.exports = Company;
