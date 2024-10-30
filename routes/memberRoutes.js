const express = require('express');
const router = express.Router();
const { signup, sendEmailVerification } = require('../controllers/memberController');
const { checkNickname } = require('../controllers/memberController');

router.post('/signup', signup);
router.post('/check-nickname', checkNickname);
router.post('/send-email-verification', sendEmailVerification);

module.exports = router;
