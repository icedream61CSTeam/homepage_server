const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

var app = express();

app.use(cors());

const connection = mysql.createConnection({
    host: '81.68.225.238',
    user: 'root',
    password: 'eudhjxapnxili1.',
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
