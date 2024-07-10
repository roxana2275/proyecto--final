const express = require('express');
const path = require('path');
const multer = require('multer');
const productosRouters = require('../routers/productos_routers');
const usuarioRouters = require('../routers/usuario_routers');
const indexRouters = require('../routers/index_routers')
const contactoRouters = require('../routers/contacto_routers');
const grilla = require('../routers/grilla_routers');
const terminos = require('../routers/terminos_routers');
const dotenv = require('dotenv');
const carrito = require('../routers/carrito_routers');
const checkout = require('../routers/checkout_routers');

dotenv.config();


const app = express();

app.use(express.json());
app.use('/repoImagenes', express.static(path.join(__dirname, '..', 'repoImagenes')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(usuarioRouters);
app.use(indexRouters);
app.use(grilla);
app.use(contactoRouters);
app.use(terminos);
app.use('/api',carrito);
app.use(checkout);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
app.use('/', productosRouters);
app.use('/', usuarioRouters);


app.listen(process.env.port_app, () => {
    console.log(`Servidor corriendo en puerto ${process.env.port_app}`);
});
