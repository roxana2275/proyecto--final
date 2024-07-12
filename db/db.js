const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();


const connection = mysql.createConnection({
    host:'mysql-figuriando.alwaysdata.net',
    user:process.env.user,
    password:process.env.password,
    database:process.env.database,
});
connection.connect((err)=>{
    if(err){
        console.log('Error al conectar con la base de datos: ',err);
        return;
    }
    console.log('Conectado a la base de datos')
})

module.exports = connection;