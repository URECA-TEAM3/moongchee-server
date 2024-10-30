const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/memberController');
const { checkNickname } = require('../controllers/memberController');

router.post('/signup', signup);
router.post('/check-nickname', checkNickname);
router.post('/update-points, updatePoints');

module.exports = router;
