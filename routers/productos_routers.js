const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productos_controllers');


router.get('/productos', productoController.formProductos);
router.get('/api/productos',productoController.getAllProducts);
router.get('/api/productos/:tipo', productoController.getProductByType);
router.get('/nuevaPublicacion',productoController.formPublicacion)

router.get('/productos/:tipo', productoController.formProductoTipo);
router.put('/productos/:id/baja',productoController.bajaPublicacion);


router.post('/mensajes', productoController.guardarMensaje);
router.post('/respuesta', productoController.guardarRespuesta);

router.post('/nuevaPublicacion',productoController.nuevaPublicacion)


module.exports = router;

