// models/Post.js

const mongoose = require("mongoose");

// schema
const postSchema = mongoose.Schema({ // 1
    title: {
        type: String,
        required: true
    },
    body: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, // 2
    updatedAt: {
        type: Date
    },
}, {
    toObject: {
        virtuals: true
    } // 4
});

// virtuals // 3
postSchema.virtual("createdDate")
    .get(() => {
        return getDate(this.createdAt);
    });

postSchema.virtual("createdTime")
    .get(() => {
        return getTime(this.createdAt);
    });

postSchema.virtual("updatedDate")
    .get(() => {
        return getDate(this.updatedAt);
    });

postSchema.virtual("updatedTime")
    .get(() => {
        return getTime(this.updatedAt);
    });

// model & export
const Post = mongoose.model("post", postSchema);
module.exports = Post;

// functions
function getDate(dateObj) {
    if (dateObj instanceof Date)
        return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
}

function getTime(dateObj) {
    if (dateObj instanceof Date)
        return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
}

function get2digits(num) {
    return ("0" + num).slice(-2);
}