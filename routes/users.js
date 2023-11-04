//引入模块
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();


//设置变量
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
var session_DB;


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
  console.log('连接icedream61数据库成功!');
});


//注册
router.post('/register', function (req, res, next) {
  const { username, password } = req.body;
  const sql = `select * from basic_info  where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var insertSql = `insert into basic_info (\`nickname\`, \`password\`) values ('${username}', '${hash}')`;
      connection.query(insertSql, function (err2, res2) {
        if (!err2) {
          res.status(200).json({ success: true, message: 'Register successful.' });
        } else {
          res.status(400).json({ success: false, message: `insert error: ${err2}` });
        }
      });
    } else {
      console.log(`重复的密码: ${results[0]["password"]}`);
      res.send('already has this nickname.');
    }
  });
});


//登录
router.post('/login', function (req, res,) {
  const { username, password } = req.body;
  const sql = `select * from basic_info where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      res.send('no this nickname.');
    } else if (results.length == 1) {
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var pwd = results[0]['password'];
      if (hash == pwd) {
        session_DB = req.session;
        session_DB.username = username;
        res.status(200).json({ success: true, message: 'Login successful.' });
        console.log('77行=' + session_DB.username)
      } else {
        res.status(200).json({ success: false, message: 'Incorrect password.' });
      }
    } else {
      res.status(200).json({ success: false, message: 'Multiple nicknames found.' });
    }
  })
  //
})


//用户页面 编辑信息
router.post('/profile', (req, res) => {
  const { username, gender, grade } = req.body;
  // 将用户信息保存到数据库
  connection.query(`UPDATE basic_info SET gender = '${gender}', grade = '${grade}' WHERE nickname = '${username}'`,
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'server保存用户信息失败' });
      } else {
        req.session.username = username;
        console.log("/profilePost.session=" + req.session.username)
        res.json({ message: '用户信息已保存' });
      }
    }
  );
});


//用户页面显示数据
router.get('/profile', (req, res) => {
  const sessionJSON2 = JSON.stringify(session_DB);
  console.log('114行=' + sessionJSON2)

  // 获取存储在会话中的用户名 
  console.log("/profileGET.session=" + session_DB.username)
  if (session_DB.username) {
    // 获取用户信息
    connection.query(
      `SELECT gender, grade FROM basic_info WHERE nickname = '${session_DB.username}'`,
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'server端获取用户信息失败' });
        } else {
          if (results.length > 0) {
            const user = results[0];
            //res.header("Content-Type", "application/json");   
            res.json(user);
          } else {
            res.status(404).json({ message: '用户不存在' });
          }
        }
      }
    );
  } else {
    res.status(401).json({ message: '未登录' });
  }
});


module.exports = router;

