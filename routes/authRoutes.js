const express = require('express');
const router = express.Router();
const { googleLogin, kakaoLogin } = require('../controllers/authController');

router.post('/google-login', googleLogin);
router.post('/kakao-login', kakaoLogin);

module.exports = router;
