const express = require('express');
const router = express.Router();
const contactoControllers = require('../controllers/contacto_controllers')



router.post('/contacto', contactoControllers.registerContacto);
router.get('/contacto', contactoControllers.contacto);


module.exports = router;