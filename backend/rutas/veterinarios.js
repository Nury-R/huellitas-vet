const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo veterinarios.js cargado correctamente');

// ======================================================
// OBTENER TODOS LOS VETERINARIOS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_veterinario,
            nombre,
            apellido,
            telefono,
            correo,
            id_especialidad
        FROM veterinario
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar veterinarios:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar los veterinarios'
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UN VETERINARIO POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_veterinario,
            nombre,
            apellido,
            telefono,
            correo,
            id_especialidad
        FROM veterinario
        WHERE id_veterinario = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar veterinario:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar el veterinario'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Veterinario no encontrado'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR VETERINARIO
// ======================================================

router.post('/', (req, res) => {

    const {
        nombre,
        apellido,
        telefono,
        correo,
        id_especialidad
    } = req.body;

    if (
        !nombre ||
        !apellido ||
        !telefono ||
        !correo ||
        !id_especialidad
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const sql = `
        INSERT INTO veterinario
        (
            nombre,
            apellido,
            telefono,
            correo,
            id_especialidad
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            telefono,
            correo,
            id_especialidad
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar veterinario:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar el veterinario'
                });
            }

            res.status(201).json({
                mensaje: 'Veterinario registrado correctamente',
                id_veterinario: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR VETERINARIO
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        apellido,
        telefono,
        correo,
        id_especialidad
    } = req.body;

    if (
        !nombre ||
        !apellido ||
        !telefono ||
        !correo ||
        !id_especialidad
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const sql = `
        UPDATE veterinario
        SET
            nombre = ?,
            apellido = ?,
            telefono = ?,
            correo = ?,
            id_especialidad = ?
        WHERE id_veterinario = ?
    `;

    conexion.query(
        sql,
        [
            nombre,
            apellido,
            telefono,
            correo,
            id_especialidad,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar veterinario:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar el veterinario'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Veterinario no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Veterinario actualizado correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR VETERINARIO
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM veterinario
        WHERE id_veterinario = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar veterinario:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el veterinario'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Veterinario no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Veterinario eliminado correctamente'
        });
    });
});


module.exports = router;