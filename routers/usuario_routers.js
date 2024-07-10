const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/ususario_controllers');
const { upload } = require('../controllers/base_imagenes_controllers');
const authenticateToken = require('../middlewares/authMiddlewares');
const imagen = require('../controllers/imagen_controllers')


router.get('/perfilDeUsuario/:id', usuarioController.formPerfilDeUsuario,authenticateToken);
router.get('/api/perfilDeUsuario/:id', authenticateToken,usuarioController.getUsuarioById);
router.put('/perfilDeUsuario/:id', authenticateToken, usuarioController.updateUsuarioById);
router.put('/api/perfilDeUsuario/:id/modificarDatos', authenticateToken,usuarioController.updateUsuarioById);
router.post('/api/perfilDeUsuario/:id/contrasenia', authenticateToken,usuarioController.modificarContrasenia);
router.put('/api/perfilDeUsuario/:id/baja', authenticateToken,usuarioController.bajaUsuarioById);

router.post('/api/perfilDeUsuario/:id/imagen', upload.single('imagen'), imagen.subirImagenUsuario);

router.get('/registro', usuarioController.formRegistro);
router.post('/registro', usuarioController.register);


router.get('/login', usuarioController.formLoguin);
router.post('/login', usuarioController.login);



router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Acceso permitido a la ruta protegida', user: req.user });
});



module.exports = router;
