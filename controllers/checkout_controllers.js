const path = require('path');


const formCheckout = (req, res) => {res.sendFile(path.join(__dirname, '..', 'checkout.html'));
}

module.exports = {
    formCheckout
}