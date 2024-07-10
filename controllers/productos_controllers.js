const db = require('../db/db');
const path = require('path');
const moment = require('moment');


const formProductos = (req, res) => {res.sendFile(path.join(__dirname, '..', 'productos.html'))};

const formPublicacion = (req,res) => {res.sendFile(path.join(__dirname, '..', 'nuevaPublicacion.html'))}

const formProductoTipo = (req, res) => {res.sendFile(path.join(__dirname, '..', 'product.html'))};
const getAllProducts = (req, res) => {

    const sql = `
        SELECT producto.tipo, publicaciones.publicacion_id, publicaciones.titulo, publicaciones.precio, publicaciones.cantidad, imagenes.nombre, imagenes.extension,publicaciones.usuario_id
        FROM publicaciones
        INNER JOIN imagenes ON publicaciones.publicacion_id = imagenes.referencia_id
        INNER JOIN producto ON publicaciones.producto_id = producto.producto_id
        WHERE publicaciones.estado = 0 AND imagenes.tipo_imagen_id = 2 AND imagenes.estado = 0 ;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(results);
    });
};

const getProductByType = (req, res) => {
    const titulo = req.params.tipo;
    const sql = 'SELECT producto.tipo, publicaciones.publicacion_id, publicaciones.titulo, publicaciones.precio, publicaciones.cantidad, imagenes.nombre, imagenes.extension,publicaciones.usuario_id FROM publicaciones INNER JOIN imagenes ON publicaciones.publicacion_id = imagenes.referencia_id INNER JOIN producto ON publicaciones.producto_id = producto.producto_id WHERE publicaciones.estado = 0 AND imagenes.tipo_imagen_id = 2 AND imagenes.estado = 0 AND producto.tipo = ?';
    db.query(sql, [titulo], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la base de datos');
            return;
        }
        res.json(results);
    });
};

const guardarMensaje = async (req, res) => {
    const { contenido, emisor_id, receptor_id, publicacion_id } = req.body;
    const fecha = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

    const insertQuery = 'INSERT INTO mensajes (emisor_id, receptor_id, contenido, fecha_envio, publicacion_id) VALUES (?, ?, ?, ?, ?)';

    db.query(insertQuery, [emisor_id, receptor_id, contenido, fecha, publicacion_id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error en la base de datos');
            return;
        }
        res.status(201).json({ message: 'Mensaje guardado correctamente' });
    });
};

const nuevaPublicacion = async (req,res) =>{
    const{titulo,precio,cantidad,imagen} = req.body
    const insertQery = 'INSERT INTO publicaciones(titulo,precio,cantidad,imagen) VALUES(?,?,?,?)';
    db.query(insertQery, [titulo,precio,cantidad,imagen],(err,results) =>{
        if(err){
            console.error(err);
            res.status(500).send('Error al guardar la publicacion');
            return;
        }
        res.status(201).json({message:'Publicacion guardada'});
    })
}



module.exports = {
    getAllProducts,
    getProductByType,
    formProductos,
    formProductoTipo,
    guardarMensaje,
    nuevaPublicacion,
    formPublicacion
    
};