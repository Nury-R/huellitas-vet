
const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo usuarios.js cargado correctamente');

router.use((req, res, next) => {
    console.log('PETICIÓN USUARIOS:', req.method, req.url);
    next();
});

// ======================================================
// 1. OBTENER TODOS LOS USUARIOS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_usuario,
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion,
            rol,
            fecha_registro
        FROM usuario
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar usuarios:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar los usuarios'
            });
        }

        res.json(resultados);
    });
});

// ======================================================
// 2. OBTENER UN USUARIO POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_usuario,
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion,
            rol,
            fecha_registro
        FROM usuario
        WHERE id_usuario = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar usuario:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar el usuario'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(resultados[0]);
    });
});

// ======================================================
// 3. REGISTRAR USUARIO
// ======================================================

router.post('/', (req, res) => {

    const {
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        direccion,
        contraseña,
        rol
    } = req.body;

    if (
        !nombre ||
        !apellido ||
        !documento ||
        !telefono ||
        !correo ||
        !direccion ||
        !contraseña ||
        !rol
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const sql = `
        INSERT INTO usuario
        (
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion,
            contraseña,
            rol,
            fecha_registro
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion,
            contraseña,
            rol
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar usuario:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar el usuario'
                });
            }

            res.status(201).json({
                mensaje: 'Usuario registrado correctamente',
                id_usuario: resultado.insertId
            });
        }
    );
});

// ======================================================
// 4. ACTUALIZAR USUARIO
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        apellido,
        documento,
        telefono,
        correo,
        direccion,
        contraseña,
        rol
    } = req.body;

    const sql = `
        UPDATE usuario
        SET
            nombre = ?,
            apellido = ?,
            documento = ?,
            telefono = ?,
            correo = ?,
            direccion = ?,
            contraseña = COALESCE(?, contraseña),
            rol = ?
        WHERE id_usuario = ?
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            documento,
            telefono,
            correo,
            direccion,
            contraseña || null,
            rol,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar usuario:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar el usuario'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Usuario actualizado correctamente'
            });
        }
    );
});

// ======================================================
// 5. ELIMINAR USUARIO
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM usuario
        WHERE id_usuario = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar usuario:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el usuario'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente'
        });
    });
});

module.exports = router;
