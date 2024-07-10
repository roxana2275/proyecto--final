const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index_controllers');


router.get('/', indexController.index);


module.exports = router;
