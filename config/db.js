const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_AWS_HOST,
  user: process.env.DB_AWS_USER,
  password: process.env.DB_AWS_PASSWORD,
  database: process.env.DB_AWS_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// db 객체를 다른 모듈에서 사용할 수 있도록 내보내기
module.exports = db;
