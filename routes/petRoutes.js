const express = require('express');
const router = express.Router();
const { registerPet, getPet, getPetDetail, updateProfile, deletePet } = require('../controllers/petController');

router.post('/animal-register', registerPet);

// 회원별 반려동물 조회
router.get('/:id', getPet);

// 반려동물별 정보 조회
router.get('/detail/:id', getPetDetail);

// 반려동물 정보 수정
router.put('/update-profile', updateProfile );

// 반려동물 정보 삭제
router.delete('/:id', deletePet);

module.exports = router;
