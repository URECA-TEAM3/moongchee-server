const express = require('express');
const router = express.Router();
const sitController = require('../controllers/sitController');

router.get('/list', sitController.getSitterList);

module.exports = router;
