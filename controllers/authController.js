require('dotenv').config();

const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/tokenUtils');

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const userId = googleResponse.data.sub;
    const [existingUser] = await db.query('SELECT id, unique_id FROM member WHERE unique_id = ?', [userId]);
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    if (existingUser.length > 0) {
      const [userData] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

      await db.query('UPDATE member SET refresh_token = ? WHERE unique_id = ?', [refreshToken, userId]);

      return res.status(200).json({
        message: '이미 가입된 회원입니다.',
        accessToken,
        refreshToken,
        exists: true,
        userData: {
          id: userData[0].id,
          name: userData[0].name,
          social_provider: userData[0].social_provider,
          petsitter: userData[0].petsitter,
          email: userData[0].email,
          phone: userData[0].phone,
          address: userData[0].address,
          detailaddress: userData[0].detailaddress,
          birthDate: userData[0].birthDate,
          unique_id: userData[0].unique_id,
          profile_image_url: userData[0].profile_image_url,
          nickname: userData[0].nickname,
          point: userData[0].point,
        },
      });
    } else {
      return res.status(200).json({
        message: '회원가입 필요',
        accessToken,
        refreshToken,
        exists: false,
        userId,
      });
    }
  } catch (error) {
    console.error('구글 로그인 오류:', error.message);
    res.status(500).json({ message: '구글 로그인 실패', error: error.message });
  }
};

exports.kakaoLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const kakaoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userId = kakaoResponse.data.id;

    console.log('카카오 고유 아디값', userId);

    const [existingUser] = await db.query('SELECT id, unique_id FROM member WHERE unique_id = ?', [userId]);

    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    if (existingUser.length > 0) {
      const [userData] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

      await db.query('UPDATE member SET refresh_token = ? WHERE unique_id = ?', [refreshToken, userId]);

      return res.status(200).json({
        message: '이미 가입된 회원입니다.',
        accessToken,
        refreshToken,
        exists: true,
        userData: {
          id: userData[0].id,
          name: userData[0].name,
          social_provider: userData[0].social_provider,
          petsitter: userData[0].petsitter,
          phone: userData[0].phone,
          email: userData[0].email,
          address: userData[0].address,
          detailaddress: userData[0].detailaddress,
          birthDate: userData[0].birthDate,
          unique_id: userData[0].unique_id,
          profile_image_url: userData[0].profile_image_url,
          nickname: userData[0].nickname,
          email: userData[0].email,
          point: userData[0].point,
        },
      });
    } else {
      await db.query('UPDATE member SET refresh_token = ? WHERE unique_id = ?', [refreshToken, userId]);

      return res.status(200).json({
        accessToken,
        refreshToken,
        exists: false,
        userId,
      });
    }
  } catch (error) {
    console.error('카카오 로그인 오류:', error.message);
    res.status(500).json({ message: '로그인 실패' });
  }
};

exports.refreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('리프레시 토큰 없음');
    return res.status(403).json({ message: '리프레시 토큰이 없습니다.' });
  }

  const refreshToken = authHeader.split(' ')[1];
  console.log('받은 리프레시 토큰:', refreshToken);

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const [existingUser] = await db.query('SELECT * FROM member WHERE refresh_token = ?', [refreshToken]);

    if (!existingUser || existingUser.length === 0) {
      console.log('DB에 저장된 리프레시 토큰과 일치하지 않음');
      return res.status(403).json({ message: '유효하지 않은 리프레시 토큰' });
    }

    const newAccessToken = generateAccessToken(user.userId);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('리프레시 토큰 검증 오류!!!!:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: '리프레시 토큰이 만료되었습니다.' });
    }
    return res.status(403).json({ message: '유효하지 않은 리프레시 토큰' });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    console.log('getUserInfo 함수 실행됨');
    const { userId } = req.user;
    console.log('요청된 유저 ID:', userId);

    const [user] = await db.query('SELECT id, name, social_provider, phone, email, address, profile_image_url, point FROM member WHERE unique_id = ?', [
      userId,
    ]);

    if (user.length === 0) {
      console.log('유저를 찾을 수 없음');
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    return res.status(200).json(user[0]);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error.message);
    res.status(500).json({ message: '사용자 정보 조회 실패' });
  }
};

// 로그아웃 로직 미리 가져옴
// exports.logout = async (req, res) => {
//   const { userId } = req.body;

//   try {
//     await db.query('UPDATE member SET refresh_token = NULL WHERE unique_id = ?', [userId]);
//     res.status(200).json({ message: '로그아웃 완료' });
//   } catch (error) {
//     console.error('로그아웃 오류:', error.message);
//     res.status(500).json({ message: '로그아웃 실패' });
//   }
// };
