const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout_controllers')
const carritoController = require('../controllers/carrito_controllers')
const authenticateToken = require('../middlewares/authMiddlewares');


router.get('/checkout',checkoutController.formCheckout );
router.get('/checkout/:userId',authenticateToken,carritoController.getCarritoByUsuarioId);
router.delete('/checkout/:carrito_items_id', authenticateToken,carritoController.deletCarritoItem);


module.exports = router;
