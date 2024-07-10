const path = require('path');

const terminos = (req, res) => {res.sendFile(path.join(__dirname, '..', 'terminosYcondiciones.html'));}


module.exports = {
    terminos
}