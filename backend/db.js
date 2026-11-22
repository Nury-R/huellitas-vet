require('dotenv').config();
const mysql = require('mysql2');

console.log('Base de datos seleccionada:', process.env.DB_NAME);

const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:', error);
    } else {
        console.log('Conexión exitosa con MySQL');
    }
});

module.exports = conexion;