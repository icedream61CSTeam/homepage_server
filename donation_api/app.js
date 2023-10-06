const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

var app = express();
app.use(cors());

const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

const connection = mysql.createConnection({
    host: dbHost,
    user: 'root',
    password: dbPassword,
    database: 'test'
});


connection.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('成功连接数据库');
    }
});

app.get('/api/data', (req, res) => {
    connection.query('SELECT * FROM `donation`', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const reversedResults = results.reverse();
            res.json(reversedResults);
        }
    });
});

const port = 3030;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
