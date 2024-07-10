const express = require('express');
const router = express.Router();
const grillaController = require('../controllers/grilla_controllers')

router.get('/grilla', grillaController.grilla);

module.exports = router;
