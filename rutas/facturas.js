const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo facturas.js cargado correctamente');

// ======================================================
// OBTENER TODAS LAS FACTURAS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_factura,
            fecha_factura,
            precio_unitario,
            total,
            id_cliente,
            id_cita,
            id_servicio
        FROM factura
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar facturas:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar las facturas',
                error: error.message,
                codigo: error.code
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UNA FACTURA POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_factura,
            fecha_factura,
            precio_unitario,
            total,
            id_cliente,
            id_cita,
            id_servicio
        FROM factura
        WHERE id_factura = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar factura:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la factura',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR FACTURA
// ======================================================

router.post('/', (req, res) => {

    const {
        fecha_factura,
        precio_unitario,
        total,
        id_cliente,
        id_cita,
        id_servicio
    } = req.body;

    if (
        !fecha_factura ||
        precio_unitario === undefined ||
        precio_unitario === null ||
        total === undefined ||
        total === null ||
        !id_cliente ||
        !id_cita ||
        !id_servicio
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        INSERT INTO factura
        (
            fecha_factura,
            precio_unitario,
            total,
            id_cliente,
            id_cita,
            id_servicio
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha_factura,
            precio_unitario,
            total,
            id_cliente,
            id_cita,
            id_servicio
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar factura:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar la factura',
                    error: error.message,
                    codigo: error.code
                });
            }

            res.status(201).json({
                mensaje: 'Factura registrada correctamente',
                id_factura: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR FACTURA
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        fecha_factura,
        precio_unitario,
        total,
        id_cliente,
        id_cita,
        id_servicio
    } = req.body;

    if (
        !fecha_factura ||
        precio_unitario === undefined ||
        precio_unitario === null ||
        total === undefined ||
        total === null ||
        !id_cliente ||
        !id_cita ||
        !id_servicio
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        UPDATE factura
        SET
            fecha_factura = ?,
            precio_unitario = ?,
            total = ?,
            id_cliente = ?,
            id_cita = ?,
            id_servicio = ?
        WHERE id_factura = ?
    `;

    conexion.query(
        sql,
        [
            fecha_factura,
            precio_unitario,
            total,
            id_cliente,
            id_cita,
            id_servicio,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar factura:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar la factura',
                    error: error.message,
                    codigo: error.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Factura no encontrada'
                });
            }

            res.status(200).json({
                mensaje: 'Factura actualizada correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR FACTURA
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM factura
        WHERE id_factura = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar factura:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar la factura',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Factura eliminada correctamente'
        });
    });
});


module.exports = router;