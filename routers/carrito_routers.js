const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito_controllers');
const authenticateToken = require('../middlewares/authMiddlewares');



router.post('/carrito',authenticateToken,carritoController.crearCarrito);

router.post('/carrito/items',authenticateToken,carritoController.agregarItems);
router.get('/carrito/usuario/:userId',authenticateToken,carritoController.getCarritoByUsuarioId);


module.exports = router;

