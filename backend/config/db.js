const mysql = require('mysql2/promise');
require('dotenv').config();

const isLocalhost = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
const useSSL = process.env.DB_SSL ? process.env.DB_SSL === 'true' : !isLocalhost;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'noteflow',

    // Cloud databases require SSL, while local WAMP / XAMPP does not
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;