const express = require('express');
const router = express.Router();
const { signup, sendEmailVerification, updateProfile} = require('../controllers/memberController');
const { checkNickname } = require('../controllers/memberController');

router.post('/signup', signup);
router.post('/check-nickname', checkNickname);
router.post('/send-email-verification', sendEmailVerification);

// 프로필 수정
router.put('/update-profile', updateProfile);

module.exports = router;
