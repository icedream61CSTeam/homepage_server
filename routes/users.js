const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'student'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL database: ', error);
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
  const sql = `select * from profile where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var insertSql = `insert into profile (\`nickname\`, \`password\`) values ('${username}', '${hash}')`;
      connection.query(insertSql, function (err2, res2) {
        if (!err2) {
          res.send('register success.');
        } else {
          console.log(`insert error: ${err2}`);
          res.send('register failed.');
        }
      });
    } else {
      console.log(`has one: ${results[0]["password"]}`);
      res.send('already has this nickname.');
    }
  });
});

router.post('/login', function (req, res, next) {
  const { username, password } = req.body;

  global.username1 = username;

  var sql = `select * from profile where nickname = '${username}'`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    if (results.length == 0) {
      res.send('no this nickname.');
    } else if (results.length == 1) {
      var hash = crypto.createHash('md5').update(password + username + 'cbzz!').digest('hex');
      var pwd = results[0]['password'];
      if (hash == pwd) {
        // 计算token，存入数据库
        var token = jwt.sign({ username }, 'jiami');   //{ expiresIn: '1s' }
        var updateSql = `UPDATE profile SET \`token\` = '${token}' WHERE \`nickname\` = '${username}'`;
        connection.query(updateSql, function (error, results, fields) {
          if (error) throw error;
          res.set('Authorization', `${token}`);
          console.log('Authorization Header:', res.get('Authorization'));
          res.send('login success.');
        });
      } else {
        res.send('password wrong.');
      }
    } else {
      res.send('multi nickname!');
    }
  })
})


router.post('/logout', function (req, res) {
  // 清除数据库端的令牌
  const updateSql = `UPDATE \`profile\` SET \`token\` = null WHERE \`nickname\` = '${global.username1}'`;
  console.log(global.username1 + ' 已经登出');
  connection.query(updateSql, function (error, results, fields) {
    if (error) throw error;
    // 响应登出成功消息
    res.send('已经成功退出');
  });
});


module.exports = router;

