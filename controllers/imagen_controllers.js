const db = require('../db/db');
const path = require('path');
const util = require('util');
const query = util.promisify(db.query).bind(db);


const subirImagenUsuario = (req, res) => {
    const { filename } = req.file;
    const usuarioId = req.params.id;

    const extension = path.extname(filename);

    const baseFilename = path.basename(filename, extension);

    const newFilename = `${baseFilename}`;

    const tipoImagenId = 1;
    const estado = 0;

    const insertImg = 'INSERT INTO imagenes (nombre, referencia_id, estado, tipo_imagen_id, extension) VALUES (?, ?, ?, ?, ?)';
    db.query(insertImg, [newFilename, usuarioId, estado, tipoImagenId, extension], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error al guardar en la base de datos: " + err.message });
        }

        const nuevaImagenId = result.insertId;

        const updateUser = 'UPDATE usuarios SET imagenes_id = ? WHERE usuario_id = ?';
        db.query(updateUser, [nuevaImagenId, usuarioId], (userErr, userResult) => {
            if (userErr) {
                return res.status(500).json({ error: "Error al actualizar el usuario: " + userErr.message });
            }
            const checkImg = 'SELECT idImagen FROM imagenes WHERE estado = 0 AND referencia_id = ? AND tipo_imagen_id = 1 AND idImagen != ?';
            db.query(checkImg, [usuarioId,  nuevaImagenId], (err, totalResult) => {
                if (err) {
                    return res.status(500).json({ error: "Error al verificar las imágenes: " + err.message });
                }

                if (totalResult.length > 0) {
                    const updateImg = 'UPDATE imagenes SET estado = 1 WHERE referencia_id = ? AND tipo_imagen_id = 1 AND idImagen != ?';
                    db.query(updateImg, [usuarioId,  nuevaImagenId], (updateErr, updateResult) => {
                        if (updateErr) {
                            return res.status(500).json({ error: "Error al actualizar las imágenes: " + updateErr.message });
                        }

                        res.json({ success: true, message: 'Perfil actualizado correctamente' });
                    });
                } else {
                    res.json({ success: true, message: 'Perfil actualizado correctamente' });
                }
            });
        });
    });
};


const subirImagenPublicacion = async (req, res) => {
    try {
        const { filename } = req.file;
        const { referencia_id } = req.body; 
        const extension = path.extname(filename);
        const tipo_imagen_id = 2; 
        const estado = 0

        await db.query('INSERT INTO imagenes (nombre, referencia_id, estado, tipo_imagen_id, extension) VALUES (?, ?, ?, ?, ?)', 
                       [filename, referencia_id, 0, tipo_imagen_id, extension]);

        res.status(200).json({ message: 'Imagen de publicación subida y guardada en la base de datos' });
    } catch (error) {
        res.status(500).json({ error: 'Error al subir la imagen de la publicación' });
    }
};

module.exports = {
    subirImagenUsuario,
    subirImagenPublicacion
};
