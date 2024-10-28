const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // 컨트롤러 임포트

// 모든 상품 조회
router.get('/', productController.getAllProducts);
router.get('/popular-products', productController.getPopularProducts);
router.get('/new-products', productController.getNewProducts);
router.get('/:id', productController.getProduct);

module.exports = router;
