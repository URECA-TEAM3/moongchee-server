const express = require('express');
const router = express.Router();
const sitController = require('../controllers/sitController');

router.get('/list', sitController.getSitterList);
router.post('/reservation/list', sitController.getUserReservations);
router.post('/reservation/cancel', sitController.cancelReservation);

module.exports = router;
