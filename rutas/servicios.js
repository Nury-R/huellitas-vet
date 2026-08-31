const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo servicios.js cargado correctamente');

// ======================================================
// OBTENER TODOS LOS SERVICIOS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_servicio,
            nombre_servicio,
            descripcion,
            costo
        FROM servicio
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar servicios:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar los servicios'
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UN SERVICIO POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_servicio,
            nombre_servicio,
            descripcion,
            costo
        FROM servicio
        WHERE id_servicio = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar servicio:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar el servicio'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Servicio no encontrado'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR SERVICIO
// ======================================================

router.post('/', (req, res) => {

    const {
        nombre_servicio,
        descripcion,
        costo
    } = req.body;

    if (
        !nombre_servicio ||
        costo === undefined ||
        costo === null
    ) {
        return res.status(400).json({
            mensaje: 'El nombre del servicio y el costo son obligatorios'
        });
    }

    const sql = `
        INSERT INTO servicio
        (
            nombre_servicio,
            descripcion,
            costo
        )
        VALUES (?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre_servicio,
            descripcion || null,
            costo
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar servicio:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar el servicio'
                });
            }

            res.status(201).json({
                mensaje: 'Servicio registrado correctamente',
                id_servicio: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR SERVICIO
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre_servicio,
        descripcion,
        costo
    } = req.body;

    if (
        !nombre_servicio ||
        costo === undefined ||
        costo === null
    ) {
        return res.status(400).json({
            mensaje: 'El nombre del servicio y el costo son obligatorios'
        });
    }

    const sql = `
        UPDATE servicio
        SET
            nombre_servicio = ?,
            descripcion = ?,
            costo = ?
        WHERE id_servicio = ?
    `;

    conexion.query(
        sql,
        [
            nombre_servicio,
            descripcion || null,
            costo,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar servicio:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar el servicio'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Servicio no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Servicio actualizado correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR SERVICIO
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM servicio
        WHERE id_servicio = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar servicio:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el servicio'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Servicio no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Servicio eliminado correctamente'
        });
    });
});


module.exports = router;