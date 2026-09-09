const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '6720',
    database: 'huellitas-vet',
    port: 3306
});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:', error);
    } else {
        console.log('Conexión exitosa con MySQL');
    }
});

module.exports = conexion;