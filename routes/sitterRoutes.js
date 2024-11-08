const express = require('express');
const router = express.Router();
const sitController = require('../controllers/sitController');

router.get('/list', sitController.getSitterList);
router.post('/apply', sitController.applySitter);
router.get('/sitter/detail', sitController.getSitterByUserId);
router.put('/sitter/update', sitController.updateSitterByUserId);
router.post('/reservation/list', sitController.getUserReservations);
router.get('/reservation/detail/:id', sitController.getReservationWithDetails);
router.post('/reservation/add', sitController.createReservationWithDetails);
router.post('/reservation/confirm', sitController.confirmReservation);
router.post('/reservation/cancel', sitController.cancelReservation);

// sitter id로 찾을 때
router.get('/sitter/detail/:id', sitController.getSitterInfoBySitterId);

// user id로 찾을 때
router.get('/sitter/byid/:id', sitController.getSitterInfoByUserId);

module.exports = router;
