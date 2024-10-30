const db = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

exports.signup = async (req, res) => {
  const { name, phone, address, birthDate, provider, token, nickname, profileImageUrl } = req.body;

  console.log('Signup Request Data:', { name, phone, address, birthDate, provider, token, nickname, profileImageUrl });

  if (!name || !phone || !address || !birthDate || !provider || !token || !nickname || !profileImageUrl) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const query = `
      INSERT INTO member (name, phone, address, birthDate, social_provider, unique_id, profile_image_url, nickname, refresh_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const refreshToken = generateRefreshToken(token);

    const values = [name, phone, address, birthDate, provider, token, profileImageUrl, nickname, refreshToken];

    const [result] = await db.query(query, values);

    res.status(201).json({ message: '회원가입 성공', userId: result.insertId, refreshToken });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '회원가입 실패' });
  }
};

exports.checkNickname = async (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }

  try {
    const query = `SELECT COUNT(*) as count FROM member WHERE nickname = ?`;
    const [rows] = await db.query(query, [nickname]);

    if (rows[0].count > 0) {
      return res.json({ available: false });
    } else {
      return res.json({ available: true });
    }
  } catch (error) {
    console.error('닉네임 중복 확인 오류:', error);
    return res.status(500).json({ message: '서버 오류. 다시 시도해주세요.' });
  }
};

exports.updatePoints = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const query = `SELECT * FROM member WHERE id = ?`;
    const [rows] = await db.query(query, [userId]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: '서버 오류. 다시 시도해주세요.' });
  }
};
