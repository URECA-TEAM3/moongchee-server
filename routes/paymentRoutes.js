const express = require('express');
const router = express.Router();
const { savePaymentInfo, confirmPayment, failPayment, approvedPayment } = require('../controllers/paymentController');

router.post('/', savePaymentInfo);
router.post('/confirm', confirmPayment);
router.get('/fail', failPayment);
router.post('/approve', approvedPayment);

module.exports = router;
