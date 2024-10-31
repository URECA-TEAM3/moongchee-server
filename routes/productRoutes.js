const express = require('express');
const router = express.Router();
const { getAllProducts, getPopularProducts, getNewProducts, getProduct } = require('../controllers/productController');

// 모든 상품 조회
router.get('/', getAllProducts);
router.get('/popular-products', getPopularProducts);
router.get('/new-products', getNewProducts);
router.get('/:id', getProduct);

module.exports = router;
