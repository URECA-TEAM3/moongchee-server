const express = require('express');
const router = express.Router();
const { getAllProducts, getPopularProducts, getNewProducts, getProduct, getProductsByIds } = require('../controllers/productController');

// 모든 상품 조회
router.get('/', getAllProducts);
router.get('/popular-products', getPopularProducts);
router.get('/new-products', getNewProducts);
router.get('/:id', getProduct);

// 여러 ID에 해당하는 상품 조회 (POST)
router.post('/getByIds', getProductsByIds);

module.exports = router;
