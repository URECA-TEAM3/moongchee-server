const express = require('express');
const router = express.Router();
const { signup, checkNickname, updatePoints } = require('../controllers/memberController');

router.post('/signup', signup);
router.post('/check-nickname', checkNickname);
router.post('/update-points', updatePoints);
router.post('/send-email-verification', sendEmailVerification);

module.exports = router;
