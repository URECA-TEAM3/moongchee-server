const express = require('express');
const router = express.Router();

const controller = require('../controllers/paymentController');

// router.route('/').get(controller.getPaymentInfo);
router.route('/').post(controller.confirmPayment);
router.route('/fail').get(controller.failPayment);

module.exports = router;
