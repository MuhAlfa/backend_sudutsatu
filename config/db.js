const mysql = require('mysql2');
const dotenv = require('dotenv');

// Untuk Membaca file .env
dotenv.config()

// Membuat pool koneksi di MySQL XAMPP
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubah Pool menjadi format promise
const promisePool = pool.promise();

module.exports = promisePool;