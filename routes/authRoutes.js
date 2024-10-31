const express = require('express');
const router = express.Router();
const { googleLogin, kakaoLogin, refreshToken, getUserInfo } = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/google-login', googleLogin);
router.post('/kakao-login', kakaoLogin);

router.post('/refresh-token', refreshToken);
router.get(
  '/user-info',
  verifyToken,
  (req, res, next) => {
    next();
  },
  getUserInfo
);

module.exports = router;
