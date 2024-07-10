const terminos = require('../controllers/terminos_controllers');
const router = require('./usuario_routers');



router.get('/terminosYcondiciones', terminos.terminos);

module.exports = router;
