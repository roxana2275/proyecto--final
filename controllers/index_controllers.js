const path = require('path');

const index = (req, res) => {res.sendFile(path.join(__dirname, '..', 'index.html'))};

module.exports ={
    index
};