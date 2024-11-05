const express = require('express');
const router = express.Router();
const { getNotifications, updateNotiStatus, saveNotification } = require('../controllers/notificationController');

// 회원별 알람 조회
router.get('/:id', getNotifications);

// 전체 알람 읽음 처리
router.put('/delete-all', updateNotiStatus);

// 알람 누적
router.post('/save', saveNotification);

module.exports = router;
