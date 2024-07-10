const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();


const authenticateToken = (req, res, next) => {
    const {authorization} = req.headers;
    
    if(!authorization) return res.sendStatus(401);
    const token = authorization.split(' ')[1];

    if (!token) {
        console.log('Token no proporcionado');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.secretKey, (err, user) => {
        if (err) {
            console.error('Error de verificación de token:', err);
            return res.sendStatus(403); 
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;





