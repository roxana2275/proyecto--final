const db = require('../db/db');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const autenticacion = require('../middlewares/authMiddlewares')

dotenv.config();


const formLoguin = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
}

const formRegistro = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'registro.html'));
}

const formPerfilDeUsuario = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'perfilDeUsuario.html'));
}

const getUsuarioById = (req, res) => {
    const usuarioId = parseInt(req.params.id);
    
    const authenticatedUserId = req.user.userId;

    if (usuarioId !== authenticatedUserId) {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    const usuarioSql = `
        SELECT usuario_id, usuarios.nombre AS usuario_nombre, apellido, numero_documento, nacimiento, email, telefono, calle, numero, piso, departamento, localidad, provincia, codigo_postal, idImagen, imagenes.nombre AS imagen_nombre, imagenes.extension
        FROM usuarios 
        LEFT JOIN imagenes ON usuario_id = referencia_id 
        AND imagenes.estado = 0 
        AND tipo_imagen_id = 1 
        WHERE usuarios.estado = 0 
        AND usuario_id = ?`;

    const productosSql = `
        SELECT 
            producto.tipo, publicaciones.publicacion_id, publicaciones.titulo, publicaciones.precio, publicaciones.cantidad, imagenes.nombre, imagenes.extension 
        FROM publicaciones 
        LEFT JOIN imagenes ON publicaciones.publicacion_id = imagenes.referencia_id 
        AND imagenes.tipo_imagen_id = 2 
        AND imagenes.estado = 0
        INNER JOIN producto ON publicaciones.producto_id = producto.producto_id 
        WHERE publicaciones.estado = 0 
        AND publicaciones.usuario_id = ?`;

    const carritoSql = `
        SELECT * FROM mensajes
        INNER JOIN publicaciones ON mensajes.publicacion_id = publicaciones.publicacion_id
        WHERE receptor_id = 7
        order by fecha_envio DESC`;

    const mensajeSql = `
        SELECT * FROM mensajes
        WHERE receptor_id = ?
        order by fecha_envio DESC
    `
    db.query(usuarioSql, [usuarioId], (err, usuarioResults) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos al obtener usuario' });
        }


        db.query(productosSql, [usuarioId], (err, productosResults) => {
            if (err) {
                return res.status(500).json({ error: 'Error en la base de datos al obtener productos' });
            }


            db.query(carritoSql, [usuarioId], (err, carritoResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en la base de datos al cargar el carrito' });
                }

                db.query(mensajeSql,[usuarioId],(err,mensajeResults) => {
                    if(err){
                        return res.status(500).json({error: 'Error en la base de datos al cargar mensajes'})
                    }


                if (usuarioResults.length > 0 && !usuarioResults[0].imagen_nombre) {
                    usuarioResults[0].imagen_nombre = 'avatar-vacio'; 
                    usuarioResults[0].extension = '.png'; 
                }

                res.json({
                    usuario: usuarioResults[0],
                    publicaciones: productosResults,
                    carrito: carritoResults,
                    mensajes:mensajeResults
                });
                });
            });
        });
    });
};


const updateUsuarioById = (req, res) => {
    const usuarioId = parseInt(req.params.id);
    const authenticatedUserId = req.user.userId;

    if (usuarioId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { nombre, apellido, email, telefono, calle, numero, piso, departamento, localidad } = req.body;
    const sql = 'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, calle = ?, numero = ?, piso = ?, departamento = ?, localidad = ? WHERE usuario_id = ?';

    db.query(sql, [nombre, apellido, email, telefono, calle, numero, piso, departamento, localidad, usuarioId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos al actualizar usuario' });
        }
        res.json({ success: true, message: 'Perfil actualizado correctamente' });
    });
};

const register = async (req, res) => {
    const { nombre, apellido, email, contrasenia } = req.body;

    if(!nombre || !apellido || !email || !contrasenia){
        return res.status(400).json({error:"Los campos estan incompletos"});
    }

    try {
        const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({error:"Error en la base de datos al verificar email "})
            }
            if (results.length > 0) {
                return res.status(400).json({ error:"El email ya está registrado "});
            }

            const hashedPassword = await bcrypt.hash(contrasenia, 10);
            const estado = 0;

            const insertQuery = 'INSERT INTO usuarios (nombre, apellido, email, contrasenia, estado) VALUES (?, ?, ?, ?, ?)';
            db.query(insertQuery, [nombre, apellido, email, hashedPassword, estado], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Error al guardar en la base "+err.message });
                }
                res.status(201).json({ message: 'Usuario registrado' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const login = (req, res) => {
    const { email, contrasenia } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ? and estado <> 1';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Error en los datos' });
        }
        if(results.length>1){
            return res.status(401).json({error:'Hay un inconveniente con su registro por favor contactese con el administrador'})
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(contrasenia, user.contrasenia);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Error en los datos' });
        }

        const token = jwt.sign(
                    { userId: user.usuario_id }, 
                    process.env.secretKey, 
                    { expiresIn: process.env.expiration});

        return res.send({ token, userId: user.usuario_id});
    });
};

const modificarContrasenia = async (req, res) => {
    const { newPassword } = req.body;
    const usuarioId = parseInt(req.user.userId); 


    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE usuarios SET contrasenia = ? WHERE usuario_id = ?';
        db.query(sql, [hashedPassword, usuarioId], (err, result) => {
            if (err) {
                console.error('Error en la base de datos al modificar contraseña:', err);
                return res.status(500).json({ error: 'Error en la base de datos al modificar contraseña' });
            }
            res.json({ message: 'Contraseña modificada correctamente' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al modificar la contraseña' });
    }
};
const bajaUsuarioById = async (req,res) => {
    const usuarioId = parseInt(req.params.id);
    const authenticatedUserId = req.user.userId;

    if (usuarioId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    try {
    const sql = 'UPDATE usuarios SET estado = 1 WHERE usuario_id = ?';

        db.query(sql,[usuarioId],(err,result) =>{
            
            if(err){
                console.error('Error en la base de datos al dar la baja al usuario', err);
                return res.status(500).json({ error: 'Error en la base de datos al dar la baja' });
            }
            res.json({menssage: "Usuario dado de baja"})
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al cargar la baja' });
    };
};

const nuevaPublicacion = (req, res) => {
    const { tipo_producto, titulo, cantidad, precio, usuario_id } = req.body;
    const filename = req.file.filename;

    // Verificar que los campos no sean undefined
    if (!tipo_producto || !titulo || !cantidad || !precio || !usuario_id) {
        return res.status(400).json({ error: "Faltan campos en el formulario" });
    }

    const cantidad_p = parseInt(cantidad);
    const precio_p = parseFloat(precio);
    const usuario_id_p = parseInt(usuario_id);
    let producto = 0;

    switch (tipo_producto.toLowerCase()) {
        case 'figuritas':
            producto = 1;
            break;
        case 'albums':
            producto = 2;
            break;
        case 'comics':
            producto = 3;
            break;
        case 'mangas':
            producto = 4;
            break;
        case 'muniecos':
            producto = 5;
            break;
        case 'eventos':
            producto = 6;
            break;
        default:
            return res.status(400).json({ error: "Tipo de producto inválido" });
    }

    const extension = path.extname(filename);
    const baseFilename = path.basename(filename, extension);
    const newFilename = `${baseFilename}`;
    const tipoImagenId = 2;
    const estado = 0;

    const insertPublicacion = `
        INSERT INTO publicaciones (usuario_id, producto_id, titulo, precio, cantidad, estado, imagenes_id) 
        VALUES (?, ?, ?, ?, ?, ?, NULL)
    `;
    const insertImg = `
        INSERT INTO imagenes (nombre, referencia_id, estado, tipo_imagen_id, extension) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertPublicacion, [usuario_id_p, producto, titulo, precio_p, cantidad_p, estado], (err, resultPub) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error al guardar la publicación: " + err.message });
        }
        const nuevaPublicacionId = resultPub.insertId;
        db.query(insertImg, [newFilename, nuevaPublicacionId, estado, tipoImagenId, extension], (err, resultImg) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error al guardar en la base de datos: " + err.message });
            }
            const nuevaImagenId = resultImg.insertId;
            const updatePublicacion = 'UPDATE publicaciones SET imagenes_id = ? WHERE publicacion_id = ?';
            db.query(updatePublicacion, [nuevaImagenId, nuevaPublicacionId], (err, resultUpdate) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: "Error al actualizar publicación nueva: " + err.message });
                } else {
                    res.json({ success: true, message: 'Publicación cargada' });
                }
            });
        });
    });
};

module.exports = { nuevaPublicacion };


module.exports = {
    getUsuarioById,
    updateUsuarioById,
    login,
    register,
    modificarContrasenia,
    bajaUsuarioById,
    formLoguin,
    formRegistro,
    formPerfilDeUsuario,
    nuevaPublicacion
}
