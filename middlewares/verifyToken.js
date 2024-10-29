const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: '인증 헤더가 없습니다.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '유효하지 않은 토큰 형식입니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    console.log('검증 성공:', decoded);
    next();
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = verifyToken;
