var express = require('express');
var app = express();
var router = require('./router/main')(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Routes
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

/* public 내부 실행 */
app.use(express.static('public'));

var server = app.listen(3000, function () {
    console.log("3000 port open")
});

