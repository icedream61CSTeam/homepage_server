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




router.post('/login', function (req, res,) {
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
        req.session.username = username;
        res.status(200).json({ success: true, message: 'Login successful.' });
        console.log('/loginPost.session=' + req.session.username)
      } else {
        res.status(400).json({ success: false, message: 'Incorrect password.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Multiple nicknames found.' });
    }
  })
})

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

router.get('/profile', (req, res) => {
  const username = req.session.username;
  // 获取存储在会话中的用户名 
  console.log("/profileGET.session=" + username)
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


router.post('/hh', (req, res) => {
  const { username } = req.body;
  req.session.username = username
  res.status(200).json({ message: 'Login successful.' });
  console.log("hhPost--session.username=" + req.session.username);
});

router.get('/hh12', (req, res) => {
  const name = req.session.username
  if (name) {
    console.log("hhGet--session.username=" + name);
    res.send("good")
  }
});





module.exports = router;

