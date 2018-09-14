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
    /**
     * 추가된 부분
     * 이미지가 저장될 경로를 찾아서
     * var imgPath = '/path/yourimage.png';
     * 이런식으로 받아준다음 버퍼에 넣어야할듯
     * 근데 그거를 잘 모르겠음
     */
    img : {
        data: Buffer,
        contentType: String
    },
    /**
     * 
     */

    required_people: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    startline: {
        type: Date,
        default: Date.now
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
        return util.getDate(this.startline);
    });

registerSchema.virtual("createdTime")
    .get(function () {
        return util.getTime(this.startline);
    });

// model & export
/* 함수인자의 첫번째 DB에서 사용될 document의 이름, 두번째는 생선된 object */
var Register = mongoose.model("register", registerSchema);
module.exports = Register;
