const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController'); // 컨트롤러 임포트

// 모든 상품 조회
router.get('/:user_id', cartController.getAllCartItems);
router.post('/', cartController.postAllCartItems);

module.exports = router;
