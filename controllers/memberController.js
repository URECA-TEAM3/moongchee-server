const db = require('../config/db');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex');
};

exports.signup = async (req, res) => {
  const { name, phone, email, address, birthDate, provider, token, nickname, profileImageUrl } = req.body;

  console.log('Signup Request Data:', { name, phone, email, address, birthDate, provider, token, nickname, profileImageUrl });

  if (!name || !phone || !email || !address || !birthDate || !provider || !token || !nickname || !profileImageUrl) {
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  }

  try {
    const query = `
    INSERT INTO member (name, phone, email, address, birthDate, social_provider, unique_id, profile_image_url, nickname, refresh_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const refreshToken = generateRefreshToken(token);
    const values = [name, phone, email, address, birthDate, provider, token, profileImageUrl, nickname, refreshToken];
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

exports.sendEmailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: '이메일을 입력해주세요.' });
  }

  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM member WHERE email = ?', [email]);
    if (rows[0].count > 0) {
      return res.status(409).json({ message: '이미 등록된 이메일 주소입니다.' });
    }

    const verificationCode = generateVerificationCode();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '이메일 인증 코드',
      text: `인증 코드: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: '인증 코드가 발송되었습니다.', code: verificationCode });
  } catch (error) {
    console.error('이메일 인증 오류:', error);
    res.status(500).json({ message: '이메일 전송에 실패했습니다.' });
  }
};
