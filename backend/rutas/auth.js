const express = require('express');
const conexion = require('../db');

const router = express.Router();
router.use((req, res, next) => {
    console.log('Llegó una petición a AUTH:', req.method, req.url);
    next();
});
console.log('Archivo auth.js cargado correctamente');

// Inicio de sesión
router.post('/login', (req, res) => {

    const { correo, contraseña } = req.body;

// Consultar que lleguen los datos
    if (!correo || !contraseña) {
        return res.status(400).json({
            mensaje: 'Por favor, ingrese correo y contraseña'
        });
    }

// Buscar usuario por correo y contraseña
    const sql = `
        SELECT * FROM usuario
        WHERE correo = ? AND contraseña = ?
    `;

    conexion.query(sql, [correo, contraseña], (error, resultados) => {

        if (error) {
            console.error('Error al consultar la base de datos:', error);

            return res.status(500).json({
                mensaje: 'Error interno del servidor'
            });
        }

 // Usuario encontrado
        if (resultados.length > 0) {

            return res.json({
                mensaje: 'Autenticación satisfactoria'
            });

        } else {

            return res.status(401).json({
                mensaje: 'Error en la autenticación'
            });
        }

    });

});

router.get('/prueba', (req, res) => {
    res.json({
        mensaje: 'Ruta auth funcionando correctamente'
    });
});
module.exports = router;