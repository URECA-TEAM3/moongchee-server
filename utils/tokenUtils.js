const jwt = require('jsonwebtoken');

// 액세스 토큰
const generateAccessToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
  const decoded = jwt.decode(token);
  console.log('새로 발급된 토큰:', token);
  console.log('발급될때 id값', userId);
  console.log('generateAccessToken토큰 만료 시간:', new Date(decoded.exp * 1000).toLocaleString());
  return token;
};

// 리프레시 토큰
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// 토큰 검증
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
