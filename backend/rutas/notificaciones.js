const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo notificaciones.js cargado correctamente');

// ======================================================
// OBTENER TODAS LAS NOTIFICACIONES
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_notificaciones,
            mensaje,
            fecha_envio,
            estado,
            id_usuario
        FROM notificaciones
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar notificaciones:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar las notificaciones',
                error: error.message,
                codigo: error.code
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UNA NOTIFICACIÓN POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_notificaciones,
            mensaje,
            fecha_envio,
            estado,
            id_usuario
        FROM notificaciones
        WHERE id_notificaciones = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar notificación:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la notificación',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Notificación no encontrada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR NOTIFICACIÓN
// ======================================================

router.post('/', (req, res) => {

    const {
        mensaje,
        fecha_envio,
        estado,
        id_usuario
    } = req.body;

    if (
        !mensaje ||
        !fecha_envio ||
        !estado ||
        !id_usuario
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        INSERT INTO notificaciones
        (
            mensaje,
            fecha_envio,
            estado,
            id_usuario
        )
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            mensaje,
            fecha_envio,
            estado,
            id_usuario
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar notificación:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar la notificación',
                    error: error.message,
                    codigo: error.code
                });
            }

            res.status(201).json({
                mensaje: 'Notificación registrada correctamente',
                id_notificaciones: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR NOTIFICACIÓN
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        mensaje,
        fecha_envio,
        estado,
        id_usuario
    } = req.body;

    if (
        !mensaje ||
        !fecha_envio ||
        !estado ||
        !id_usuario
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        UPDATE notificaciones
        SET
            mensaje = ?,
            fecha_envio = ?,
            estado = ?,
            id_usuario = ?
        WHERE id_notificaciones = ?
    `;

    conexion.query(
        sql,
        [
            mensaje,
            fecha_envio,
            estado,
            id_usuario,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar notificación:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar la notificación',
                    error: error.message,
                    codigo: error.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Notificación no encontrada'
                });
            }

            res.status(200).json({
                mensaje: 'Notificación actualizada correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR NOTIFICACIÓN
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM notificaciones
        WHERE id_notificaciones = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar notificación:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar la notificación',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Notificación no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Notificación eliminada correctamente'
        });
    });
});


module.exports = router;