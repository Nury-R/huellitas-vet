const express = require('express');
const bcrypt = require('bcrypt');
const conexion = require('../db');

const router = express.Router();

// Para el registro de usuario
router.post('/registro', async (req, res) => {

    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({
            mensaje: 'Ingrese usuario y contraseña'
        });
    }

    try {

        // Para encriptar contraseña
        const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

        const sql = `
            INSERT INTO usuarios (usuario, contraseña)
            VALUES (?, ?)
        `;

        conexion.query(
            sql,
            [usuario, contraseñaEncriptada],
            (error, resultado) => {

                if (error) {

                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            mensaje: 'El usuario ya existe'
                        });
                    }

                    return res.status(500).json({
                        mensaje: 'Error al registrar usuario'
                    });
                }

                res.status(201).json({
                    mensaje: 'Usuario registrado correctamente'
                });
            }
        );

    } catch (error) {

        res.status(500).json({
            mensaje: 'Error en el servidor'
        });
    }
});


// Para inicio de sesión
router.post('/login', (req, res) => {

    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({
            mensaje: 'Debe ingresar usuario y contraseña'
        });
    }

    const sql = `
        SELECT * FROM usuarios
        WHERE usuario = ?
    `;

    conexion.query(sql, [usuario], async (error, resultados) => {

        if (error) {
            return res.status(500).json({
                mensaje: 'Error en el servidor'
            });
        }

        // Mensaje de error
        if (resultados.length === 0) {
            return res.status(401).json({
                mensaje: 'Error en la autenticación'
            });
        }

        const usuarioBD = resultados[0];

        // Comparación de la contraseña
        const contraseñaCorrecta = await bcrypt.compare(
            contraseña,
            usuarioBD.contraseña
        );

        if (contraseñaCorrecta) {

            res.json({
                mensaje: 'Autenticación satisfactoria'
            });

        } else {

            res.status(401).json({
                mensaje: 'Error en la autenticación'
            });
        }
    });
});

module.exports = router;