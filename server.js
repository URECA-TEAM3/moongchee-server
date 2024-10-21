const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initializeDatabase = async () => {
  try {
    await db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await db.query(`USE ${process.env.DB_NAME}`);

    await db.query(`
      CREATE TABLE IF NOT EXISTS member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        social_provider VARCHAR(50) NOT NULL,
        petsitter TINYINT(1) DEFAULT 0,
        phone VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        birthDate VARCHAR(50),
        unique_id VARCHAR(50)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS pet (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        age INT,
        weight FLOAT,
        species VARCHAR(50),
        gender VARCHAR(50),
        surgery TINYINT(1) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES member(id) ON DELETE CASCADE
      )
    `);

    console.log('데이터베이스와 테이블이 성공적으로 초기화되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  }
};

initializeDatabase();

app.set('port', process.env.PORT || 3000);

app.post('/api/animal-register', async (req, res) => {
  const { userId, name, age, weight, species, gender, surgery } = req.body;

  if (!userId || !name || !age || !weight || !species || !gender) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const query = `
      INSERT INTO pet (user_id, name, age, weight, species, gender, surgery)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, name, age, weight, species, gender, surgery];

    await db.query(query, values);

    res.status(201).json({ message: '반려동물 등록 성공' });
  } catch (error) {
    console.error('반려동물 정보 저장 오류:', error);
    res.status(500).json({ message: '반려동물 정보 저장 실패' });
  }
});

app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    const googleUserData = googleResponse.data;
    const userId = googleUserData.sub;

    console.log('구글 사용자 ID:', userId);

    const [existingUser] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

    if (existingUser.length > 0) {
      return res.status(200).json({ message: '이미 가입된 회원입니다.', exists: true });
    }

    res.status(200).json({ message: '회원가입 필요', exists: false, userId });
  } catch (error) {
    console.error('로그인 오류:', error.message);
    res.status(500).json({ message: '구글 로그인 실패', error: error.message });
  }
});

app.post('/api/kakao-login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data;
    const userId = userData.id;

    const [existingUser] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

    if (existingUser.length > 0) {
      return res.status(200).json({ message: '이미 가입된 회원입니다.', exists: true, userId });
    }

    res.status(200).json({ message: '회원가입 필요', exists: false, userId });
  } catch (error) {
    console.error('카카오 로그인 오류:', error.message);
    res.status(500).json({ message: '카카오 로그인 실패' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { name, phone, address, birthDate, provider, token } = req.body;

  if (!name || !phone || !address || !birthDate || !provider || !token) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const query = `
      INSERT INTO member (name, phone, address, birthDate, social_provider, unique_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [name, phone, address, birthDate, provider, token];

    const [result] = await db.query(query, values);

    res.status(201).json({ message: '회원가입 성공', userId: result.insertId });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '회원가입 실패' });
  }
});

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 서버 실행 중`);
});
