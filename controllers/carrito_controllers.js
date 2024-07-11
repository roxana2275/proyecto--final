const db = require('../db/db');
const dotenv = require('dotenv');
const moment = require('moment');
const autenticacion = require('../middlewares/authMiddlewares')



dotenv.config();

const obtenerCarritoPendiente = (usuario, callback) => {
    const selectQuery = 'SELECT carrito_id FROM carrito WHERE usuarios_id = ? AND estado = 0';
    db.query(selectQuery, [usuario], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        if (result.length > 0) {
            return callback(null, result[0].carrito_id);
        } else {
            return callback(null, null);
        }
    });
};

const crearCarrito = (req, res) => {
    const { usuario, estado } = req.body;
    const authenticatedUserId = usuario;


    if (!authenticatedUserId) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    obtenerCarritoPendiente(authenticatedUserId, (err, carritoIdExistente) => {

        if (err) {
            return res.status(500).json({ error: "Error al verificar carrito existente " + err.message });
        }

        if (carritoIdExistente) {
            res.status(200).json({ carrito_id: carritoIdExistente, message: 'Carrito existente encontrado' });
        } else {
            const fecha = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

            const insertQuery = 'INSERT INTO carrito (usuarios_id, fecha, estado) VALUES (?, ?, ?)';
            db.query(insertQuery, [usuario, fecha, 0], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Error al guardar en la base " + err.message });
                }
                const carritoId = result.insertId;
                res.status(201).json({ carrito_id: carritoId, message: 'Carrito creado' });
            });
        }
    });
};

const agregarItems = (req, res) => {
    const { carrito_id, publicacion_id} = req.body;

    const insertQuery = 'INSERT INTO carrito_items (carrito_id, publicacion_id, cantidad) VALUES (?, ?, ?)';
    db.query(insertQuery, [carrito_id, publicacion_id,1], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al agregar producto " + err.message });
        }
        res.status(201).json({ message: "Item agregado" });
    });
};

const getCarritoByUsuarioId = (req, res) => {
    const usuarioId = req.user.userId;
    const carritoSql = `
        SELECT carrito_items.carrito_items_id,carrito_items.carrito_id, publicaciones.publicacion_id, publicaciones.titulo, publicaciones.precio, carrito_items.cantidad
        FROM carrito_items
        INNER JOIN carrito ON carrito_items.carrito_id = carrito.carrito_id
        INNER JOIN publicaciones ON carrito_items.publicacion_id = publicaciones.publicacion_id
        WHERE carrito.estado = 0 AND carrito.usuarios_id = ?`;

    db.query(carritoSql, [usuarioId], (err, carritoResults) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos al cargar el carrito' });
        }
        res.json(carritoResults);
    });
};

const deletCarritoItem = (req, res) => {
    const { carrito_items_id } = req.params;
    const deleteQuery = 'DELETE FROM carrito_items WHERE carrito_items_id = ?';
    db.query(deleteQuery, [carrito_items_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al eliminar el producto del carrito " + err.message });
        }

        res.status(200).json({ message: "Producto eliminado del carrito" });
    });
}


module.exports = {
    crearCarrito,
    agregarItems,
    getCarritoByUsuarioId,
    deletCarritoItem

};
