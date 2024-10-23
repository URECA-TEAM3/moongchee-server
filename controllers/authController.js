const axios = require('axios');
const db = require('../config/db');

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '토큰이 없습니다.' });
  }

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const userId = googleResponse.data.sub;

    const [existingUser] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

    if (existingUser.length > 0) {
      return res.status(200).json({ message: '이미 가입된 회원입니다.', exists: true });
    }

    res.status(200).json({ message: '회원가입 필요', exists: false, userId });
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
    const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userId = response.data.id;

    const [existingUser] = await db.query('SELECT * FROM member WHERE unique_id = ?', [userId]);

    if (existingUser.length > 0) {
      return res.status(200).json({ message: '이미 가입된 회원입니다.', exists: true });
    }

    res.status(200).json({ message: '회원가입 필요', exists: false, userId });
  } catch (error) {
    console.error('카카오 로그인 오류:', error.message);
    res.status(500).json({ message: '카카오 로그인 실패' });
  }
};
