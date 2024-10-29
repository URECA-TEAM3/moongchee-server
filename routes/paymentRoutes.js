const express = require('express');
const router = express.Router();

const controller = require('../controllers/paymentController');

router.route('/').post(controller.savePaymentInfo);
router.route('/confirm').post(controller.confirmPayment);
router.route('/fail').get(controller.failPayment);

module.exports = router;
