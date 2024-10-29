const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController'); // 컨트롤러 임포트

// 모든 상품 조회
router.get('/:user_id', cartController.getAllCartItems);
router.get('/CheckoutItems/:user_id', cartController.getCheckoutItems);
router.post('/', cartController.postAllCartItems);
router.delete('/:cart_id', cartController.DeleteCartItems);
router.post('/save', cartController.saveCartItems);

module.exports = router;
