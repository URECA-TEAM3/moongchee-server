const express = require('express');
const router = express.Router();
const { registerPet } = require('../controllers/petController');

router.post('/animal-register', registerPet);

module.exports = router;
