// 필요한 모듈과 환경 변수 불러오기
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
dotenv.config();

// 라우트 모듈 불러오기
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const petRoutes = require('./routes/petRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sitterRoutes = require('./routes/sitterRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// CORS 설정
app.use(
  cors({
    origin: ['https://moongchee.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// JSON 파싱
app.use(bodyParser.json());
app.use(express.json());

// 기본 라우트 설정
app.get('/', (req, res) => res.send('Express on Vercel'));

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/petsitter', sitterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// MySQL 테이블 생성 함수
const createTables = async () => {
  try {
    const db = mysql.createPool({
      host: process.env.DB_AWS_HOST,
      user: process.env.DB_AWS_USER,
      password: process.env.DB_AWS_PASSWORD,
      database: process.env.DB_AWS_NAME,
      port: process.env.DB_AWS_PORT,
    });
    const connection = await db.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS member (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL, 
        social_provider VARCHAR(50) NOT NULL, 
        petsitter TINYINT(1) NOT NULL DEFAULT 0,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,  
        address VARCHAR(255) NOT NULL, 
        detailaddress VARCHAR(255) DEFAULT NULL, 
        birthDate VARCHAR(50) NOT NULL,
        unique_id VARCHAR(50) NOT NULL,
        profile_image_url VARCHAR(255) NOT NULL,
        nickname VARCHAR(15) NOT NULL,
        refresh_token VARCHAR(255) NOT NULL,
        point INT NOT NULL DEFAULT 0,
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

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product (
        id BIGINT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        sales INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        quantity INT NOT NULL,
        checked BOOLEAN
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sitter (
        id BIGINT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        userId VARCHAR(255) NOT NULL, 
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        experience TEXT NOT NULL,
        startTime VARCHAR(50) NOT NULL,
        endTime VARCHAR(50) NOT NULL,
        weekdays VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_table (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        total DOUBLE NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservation (
        id BIGINT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        user_id INT NOT NULL,
        sitter_id INT NOT NULL,
        requestDate VARCHAR(100) NOT NULL,
        startTime VARCHAR(50) NOT NULL,
        endTime VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_item (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        order_id BIGINT NOT NULL,
        quantity INT NOT NULL,
        price INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        order_date DATE,
        user_id BIGINT NOT NULL
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservation_details (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        reservation_id BIGINT NOT NULL,
        request TEXT,
        dogSize VARCHAR(50),
        pet VARCHAR(50),
        workingTime VARCHAR(50),
        price DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_verification (
        order_id VARCHAR(50) NOT NULL,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        PRIMARY KEY (order_id),
        FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE
      );
      `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_approved (
        order_id VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        payment_key VARCHAR(50) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES payment_verification(order_id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification (
        id BIGINT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        sending_name VARCHAR(50) NOT NULL,
        receive_id BIGINT NOT NULL,
        receive_name VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
      );
    `);

    console.log('테이블이 성공적으로 생성되었습니다.');
    connection.release();
  } catch (err) {
    console.error('테이블 생성 오류 발생:', err);
  }
};

(async () => {
  await createTables();
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
    });
  }
})();

module.exports = app;
