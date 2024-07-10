const path = require('path');


const grilla = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'grilla2.html'));
}

module.exports = {
    grilla
}