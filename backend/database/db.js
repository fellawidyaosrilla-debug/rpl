const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'temu_cepat'
});

db.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL:", err);
    } else {
        console.log("MySQL Connected...");
    }
});

module.exports = db;
