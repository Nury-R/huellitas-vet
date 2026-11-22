const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo pagos.js cargado correctamente');

// ======================================================
// OBTENER TODOS LOS PAGOS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_pago,
            fecha_pago,
            metodo_pago,
            estado_pago,
            valor,
            id_factura
        FROM pago
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar pagos:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar los pagos',
                error: error.message,
                codigo: error.code
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UN PAGO POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_pago,
            fecha_pago,
            metodo_pago,
            estado_pago,
            valor,
            id_factura
        FROM pago
        WHERE id_pago = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar pago:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar el pago',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR PAGO
// ======================================================

router.post('/', (req, res) => {

    const {
        fecha_pago,
        metodo_pago,
        estado_pago,
        valor,
        id_factura
    } = req.body;

    if (
        !fecha_pago ||
        !metodo_pago ||
        !estado_pago ||
        valor === undefined ||
        valor === null ||
        !id_factura
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        INSERT INTO pago
        (
            fecha_pago,
            metodo_pago,
            estado_pago,
            valor,
            id_factura
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha_pago,
            metodo_pago,
            estado_pago,
            valor,
            id_factura
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar pago:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar el pago',
                    error: error.message,
                    codigo: error.code
                });
            }

            res.status(201).json({
                mensaje: 'Pago registrado correctamente',
                id_pago: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR PAGO
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        fecha_pago,
        metodo_pago,
        estado_pago,
        valor,
        id_factura
    } = req.body;

    if (
        !fecha_pago ||
        !metodo_pago ||
        !estado_pago ||
        valor === undefined ||
        valor === null ||
        !id_factura
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        UPDATE pago
        SET
            fecha_pago = ?,
            metodo_pago = ?,
            estado_pago = ?,
            valor = ?,
            id_factura = ?
        WHERE id_pago = ?
    `;

    conexion.query(
        sql,
        [
            fecha_pago,
            metodo_pago,
            estado_pago,
            valor,
            id_factura,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar pago:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar el pago',
                    error: error.message,
                    codigo: error.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Pago no encontrado'
                });
            }

            res.status(200).json({
                mensaje: 'Pago actualizado correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR PAGO
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM pago
        WHERE id_pago = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar pago:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el pago',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Pago eliminado correctamente'
        });
    });
});


module.exports = router;