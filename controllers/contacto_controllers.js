const db = require('../db/db');
const path = require('path');


const contacto = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contacto2.html'));
}

const registerContacto = async (req, res) => {
    const formData = req.body; 

    try {
        let tipo_de_contacto_id;
        if (formData.tipo_mensaje === 'Reclamos') {
            tipo_de_contacto_id = 1;
        } else if (formData.tipo_mensaje === 'Sugerencias') {
            tipo_de_contacto_id = 2;
        } else {
            tipo_de_contacto_id = 3;
        }

        const insertQuery = 'INSERT INTO contacto (nombre, apellido, email, telefono, tipo_contacto_id, mensaje, calificacion) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(insertQuery, [formData.nombre, formData.apellido, formData.email, formData.telefono, tipo_de_contacto_id, formData.mensaje, formData.calificacion], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al guardar el mensaje' });
            }
            res.status(201).json({ message: 'Mensaje enviado' });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
};




module.exports = {
    registerContacto,
    contacto,
};