const express = require('express');
const router = express.Router();
const { getAllCartItems, postPayItems, postAllCartItems, DeleteCartItems, saveCartItems } = require('../controllers/cartController'); // 컨트롤러 임포트

router.get('/:user_id', getAllCartItems);
router.post('/', postAllCartItems);
router.post('/pay', postPayItems);
router.post('/save', saveCartItems);
router.delete('/:cart_id', DeleteCartItems);

module.exports = router;
