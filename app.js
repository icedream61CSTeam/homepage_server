const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mysql = require('mysql2');
const path = require('path');
const usersRouter = require('./routes/users');
const app = express();
require('dotenv').config();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());   //这一条不加，无法读取传来的post请求
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
//------------开始连接数据库--------------
const connection = mysql.createConnection({
  host: dbHost,
  user: 'root',
  password: dbPassword,
  database: 'user_data'
});
connection.connect();


app.use('/users', usersRouter);


app.get('/users/test', (req, res) => {
  const headers = req.headers;
  const token = headers['authorization'].split(' ')[1];

  if (!token) {
    // 如果请求中没有提供令牌，则返回未授权状态
    return res.status(401).send('没有token,无法访问');
  }
  // 从数据库中获取对应用户的令牌
  connection.query(
    `SELECT \`token\` FROM \`profile\` WHERE \`nickname\` = '${global.username1}'`,
    (err, results) => {
      if (err) {
        return res.status(500).send('数据库查询错误');
      }

      if (results.length === 0) {
        return res.status(403).send('数据库查询不到该用户名');
      }

      const dbToken = results[0].token;

      // 检查令牌是否匹配
      if (token !== dbToken) {
        return res.status(403).send('token不匹配,验证失败');
      }

      res.send('token匹配成功!只有登陆成功后才能看到此消息!');
    }
  );
});


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
