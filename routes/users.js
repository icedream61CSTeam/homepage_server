const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();


const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;


const connection = mysql.createConnection({
  host: dbHost,
  user: 'root',
  password: dbPassword,
  database: 'user_data'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL icedream61: ', error);
    return;
  }
  console.log('连接数据库成功!');
});


/*GET users listing. */
router.get('/', function (req, res, next) {
  res.sendFile('views/users.html', { root: process.cwd() });
});


router.post('/register', function (req, res, next) {
  const { username, password } = req.body;
  const sql = `select * from basic_info  where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      console.log("username(注册)  " + username);
      console.log("password(注册)  " + password);
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var insertSql = `insert into basic_info (\`nickname\`, \`password\`) values ('${username}', '${hash}')`;
      connection.query(insertSql, function (err2, res2) {
        if (!err2) {
          res.send('register success.');
        } else {
          console.log(`insert error: ${err2}`);
          res.send('register failed.');
        }
      });
    } else {
      console.log(`重复的密码: ${results[0]["password"]}`);
      res.send('already has this nickname.');
    }
  });
});

router.post('/login', function (req, res, next) {
  const { username, password } = req.body;

  var sql = `select * from basic_info where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      res.send('no this nickname.');
    } else if (results.length == 1) {
      console.log("username(登录)  " + username);
      console.log("password(登录)  " + password);
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var pwd = results[0]['password'];
      console.log("hash  " + hash);
      console.log("pwd  " + pwd);
      if (hash == pwd) {
        res.status(200).json({ success: true, message: 'Login successful.' });
      } else {
        res.status(400).json({ success: false, message: 'Incorrect password.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Multiple nicknames found.' });
    }
  })
})


router.post('/logout', function (req, res) {
  // 清除数据库端的令牌
  const updateSql = `UPDATE \`basic_info\` SET \`token\` = null WHERE \`nickname\` = '${global.username1}'`;
  console.log(global.username1 + ' 已经登出');
  connection.query(updateSql, function (error, results, fields) {
    if (error) throw error;
    // 响应登出成功消息
    res.send('已经成功退出');
  });
});


module.exports = router;

