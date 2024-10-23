const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const petRoutes = require('./routes/petRoutes');
const productRoutes = require('./routes/product');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS Moongchee');
    console.log('moongchee 데이터베이스가 생성되었거나 이미 존재.');
    await connection.end();
  } catch (err) {
    console.error('데이터베이스 생성  오류 :', err);
  }
};

const createTables = async () => {
  try {
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'moongchee',
    });
    const connection = await db.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS member (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        social_provider VARCHAR(50) NOT NULL,
        petsitter TINYINT(1) NULL DEFAULT 0,
        phone VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        birthDate VARCHAR(50) NULL,
        unique_id VARCHAR(50) NULL,
        profile_image_url VARCHAR(255) NULL,
        nickname VARCHAR(8) NULL,
        PRIMARY KEY (id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS pet (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        age INT NULL,
        weight FLOAT NULL,
        species VARCHAR(50) NULL,
        gender VARCHAR(50) NULL,
        surgery TINYINT(1) NULL DEFAULT 0,
        animal_image_url VARCHAR(255) NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE
      );
    `);

    console.log('테이블이 성공생성.');
    connection.release();
  } catch (err) {
    console.error('테이블 오류 발생:', err);
  }
};

(async () => {
  await createDatabase();
  await createTables();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
  });
})();
