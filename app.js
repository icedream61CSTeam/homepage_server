const express = require('express');
const createError = require('http-errors');
const usersRouter = require('./routes/users');
const bodyParser = require('body-parser')
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();
const session = require('express-session');

app.use(session({
  secret: '签名', // 给session ID cookie 签名
  name: 'user_login', //默认是connect.sid
  cookie: { maxAge: 15000 },
  resave: false,
  saveUninitialized: true,

}));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());   //这一条不加，无法读取传来的post请求
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use('/users', usersRouter);







// catch 404 and forward to error handler  以下是报错信息
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
