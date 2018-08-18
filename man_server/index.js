const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // body-parser은 POST요청 데이터를 추출하는 미들웨어.
const methodOverride = require("method-override");
const app = express();

// DB setting
mongoose.connect(process.env.MONGO_DB, {
    promiseLibrary: global.Promise
});
const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");
});
db.on("error", (err) => {
    console.log("DB ERROR : ", err);
});

// Other settings
// 미들웨어 설정
/* ejs를 사용하기 위해서 express의 view engine에 ejs를 set */
app.set("view engine", "ejs");

/* app.use는 HTTP method에 상관없이 무조건 실행하는 부분. 
__dirname은 node.js에서 프로그램이 실행중인 파일의 위치를 나타내는 global variable.
=> 현재위치 /public을 static폴더로 지정
'/'에 접속하면 '/public'에, '/css'에 접속하면 '/public/css'에 접속 */
app.use(express.static(__dirname + "/public")); 

/* bodyParser로 stream의 form data를 req.body에 옮김. */
app.use(bodyParser.json()); // json data를
app.use(bodyParser.urlencoded({ // urlencoded data를 분석
    extended: true
})); 
// true를 해줘야함. extended 는 중첩된 객체표현을 허용할지 말지를 정하는 것. 
//객체 안에 객체를 파싱할 수 있게하려면 true.

app.use(methodOverride("_method"));
/*
// DB schema // schema object 생성
const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    }
});

/* 함수인자의 첫번째 DB에서 사용될 document의 이름, 두번째는 생선된 object */
/*
const Contact = mongoose.model("contact", contactSchema); // mongoose.model함수를 사용하여 contact schema의 model을 생성.

// Home // 6
app.get("/", (req, res) => {
    res.redirect("/contacts");
});

// Contacts - Index // 7
app.get("/contacts", (req, res) => {
    Contact.find({}, (err, contacts) => {
        if (err) return res.json(err);
        res.render("contacts/index", { // 
            contacts // 검색결과가 한 개 이상일 수 있기 때문에 항상 array 없다면 빈 array 반환.
        });
    })
});
// Contacts - New // 8
app.get("/contacts/new", (req, res) => {
    res.render("contacts/new");
});
// Contacts - create // 9
app.post("/contacts", (req, res) => {
    Contact.create(req.body, (err, contact) => {
        if (err) return res.json(err);
        res.redirect("/contacts");
    });
});
 */

// Routes
app.use("/", require("./routes/home"));
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts")); // 1



// Port setting ...
app.listen(3000, () => {
    console.log("server on!");
});
