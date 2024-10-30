const express = require('express');
const router = express.Router();
const { registerPet, getPet, getPetDetail } = require('../controllers/petController');

router.post('/animal-register', registerPet);

// 회원별 반려동물 조회
router.get('/:id', getPet);

// 반려동물별 정보 조회
router.get('/detail/:id', getPetDetail);

module.exports = router;
