var mongoose = require("mongoose");
var util = require("../util");

// schema
// DB schema // schema object 생성
var registerSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required!"]
    },
    sub_title: { 
        type: String,
        required: true
    },
    // post에 작성자 정보(user.id)를 기록하고, 이 정보는 user collection에서 가져오는 것임을 ref를 통해서 지정
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    finished: {
        type: Boolean,
        required: true
    },
    join_people: {
        type: Number,
        required: true
    },
    required_people: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        
    },
    deadline: {
        type: Number,
        
    },
    startline: {
        type: Date,
        default: Date.now,
        required: true
    },
    require_condition: {
        type: String,
        require: true
    },
    body: {
        type: String,
        require: true
    },
}, {
    toObject: {
        virtuals: true
    }
});

// virtuals
registerSchema.virtual("createdDate")
    .get(function () {
        return util.getDate(this.createdAt);
    });

registerSchema.virtual("createdTime")
    .get(function () {
        return util.getTime(this.createdAt);
    });

registerSchema.virtual("updatedDate")
    .get(function () {
        return util.getDate(this.updatedAt);
    });

registerSchema.virtual("updatedTime")
    .get(function () {
        return util.getTime(this.updatedAt);
    });

// model & export
/* 함수인자의 첫번째 DB에서 사용될 document의 이름, 두번째는 생선된 object */
var Register = mongoose.model("register", registerSchema);
module.exports = Register;
