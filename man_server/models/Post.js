var mongoose = require("mongoose");
var util = require("../util");

// schema
// DB schema // schema object 생성
var postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required!"]
    },
    body: { 
        type: String,
        required: [true, "Body is required!"]
    },
    // post에 작성자 정보(user.id)를 기록하고, 이 정보는 user collection에서 가져오는 것임을 ref를 통해서 지정
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
}, {
    toObject: {
        virtuals: true
    }
});

// virtuals
postSchema.virtual("createdDate")
    .get(function() {
        return util.getDate(this.createdAt);
    });

postSchema.virtual("createdTime")
    .get(function() {
        return util.getTime(this.createdAt);
    });

postSchema.virtual("updatedDate")
    .get(function() {
        return util.getDate(this.updatedAt);
    });

postSchema.virtual("updatedTime")
    .get(function() {
        return util.getTime(this.updatedAt);
    });

// model & export
/* 함수인자의 첫번째 DB에서 사용될 document의 이름, 두번째는 생선된 object */
var Post = mongoose.model("post", postSchema);
module.exports = Post;
