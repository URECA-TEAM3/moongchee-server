const express = require('express');
const router = express.Router();
const sitController = require('../controllers/sitController');

router.get('/list', sitController.getSitterList);
router.post('/apply', sitController.applySitter);
router.post('/reservation/list', sitController.getUserReservations);
router.post('/reservation/add', sitController.createReservationWithDetails);
router.post('/reservation/confirm', sitController.confirmReservation);
router.post('/reservation/cancel', sitController.cancelReservation);

module.exports = router;
