const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();
const session = require('express-session');
const cors = require('cors');


const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
router.use(cors());
router.use(session({
  secret: 'your-secret-key', // 使用你自己的密钥
  resave: false,
  saveUninitialized: true
}));

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




router.post('/login', function (req, res, next) {
  const { username, password } = req.body;

  var sql = `select * from basic_info where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      res.send('no this nickname.');
    } else if (results.length == 1) {
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var pwd = results[0]['password'];
      if (hash == pwd) {
        res.status(200).json({ success: true, message: 'Login successful.' });
        req.session.username = username; //储存username
        console.log('登入后的log' + req.session.username)
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

router.post('/profile', (req, res) => {
  const { username, gender, grade } = req.body;
  // 将用户信息保存到数据库
  connection.query(`UPDATE basic_info SET gender = '${gender}', grade = '${grade}' WHERE nickname = '${username}'`,
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'server保存用户信息失败' });
      } else {
        res.json({ message: '用户信息已保存' });
      }
    }
  );
});

router.get('/profile', (req, res) => {
  const { username } = req.session; // 获取存储在会话中的用户名
  console.log("这个PROFILE GET的请求log--" + username)
  if (username) {
    // 获取用户信息
    connection.query(
      `SELECT gender, grade FROM basic_info WHERE nickname = '${username}'`,
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'server端获取用户信息失败' });
        } else {
          if (results.length > 0) {
            const user = results[0];
            res.json(user);
            res.send("返回成功");
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

