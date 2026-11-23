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
            tipo_pago,
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
            tipo_pago,
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
        tipo_pago,
        valor,
        id_factura
    } = req.body;

    const monto = Number(valor);
    const facturaId = Number(id_factura);

    if (
    !fecha_pago ||
    !metodo_pago ||
    !estado_pago ||
    !tipo_pago ||
    !['Completo', 'Abono'].includes(tipo_pago) ||
    valor === undefined ||
    valor === null ||
    !id_factura
) {
    return res.status(400).json({
        mensaje: 'Todos los campos obligatorios deben ser diligenciados'
    });
}

    const sqlFactura = `
        SELECT total
        FROM factura
        WHERE id_factura = ?
    `;

    conexion.query(sqlFactura, [facturaId], (error, facturas) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar la factura.',
                error: error.message
            });
        }

        if (facturas.length === 0) {
            return res.status(404).json({
                mensaje: 'La factura seleccionada no existe.'
            });
        }

        const totalFactura = Number(facturas[0].total);

        const sqlPagado = `
            SELECT COALESCE(SUM(valor), 0) AS total_pagado
            FROM pago
            WHERE id_factura = ?
              AND estado_pago = 'Pagado'
        `;

        conexion.query(sqlPagado, [facturaId], (error, resultados) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'Error al consultar los pagos anteriores.',
                    error: error.message
                });
            }

            const totalPagado = Number(resultados[0].total_pagado);
            const saldoPendiente = totalFactura - totalPagado;

            if (
                estado_pago === 'Pagado' &&
                monto > saldoPendiente
            ) {
                return res.status(400).json({
                    mensaje: `El valor supera el saldo pendiente de $${saldoPendiente.toLocaleString('es-CO')}.`
                });
            }

            const sqlInsertar = `
                INSERT INTO pago
                (
                    fecha_pago,
                    metodo_pago,
                    estado_pago,
                    tipo_pago,
                    valor,
                    id_factura
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            conexion.query(
                sqlInsertar,
                [
                    fecha_pago,
                    metodo_pago,
                    estado_pago,
                    tipo_pago,
                    monto,
                    facturaId
                ],
                (error, resultado) => {
                    if (error) {
                        return res.status(500).json({
                            mensaje: 'Error al registrar el pago.',
                            error: error.message
                        });
                    }

                    res.status(201).json({
                        mensaje: 'Pago registrado correctamente.',
                        id_pago: resultado.insertId,
                        
                    });
                }
            );
        });
    });
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
        tipo_pago,
        valor,
        id_factura
    } = req.body;

    const monto = Number(valor);
    const facturaId = Number(id_factura);

    if (
    !fecha_pago ||
    !metodo_pago ||
    !estado_pago ||
    !tipo_pago ||
    !['Completo', 'Abono'].includes(tipo_pago) ||
    !Number.isFinite(monto) ||
    monto <= 0 ||
    !Number.isInteger(facturaId) ||
    facturaId <= 0
) {
        return res.status(400).json({
            mensaje: 'Verifica los datos del pago. El valor debe ser mayor que cero.'
        });
    }

    const sqlFactura = `
        SELECT total
        FROM factura
        WHERE id_factura = ?
    `;

    conexion.query(sqlFactura, [facturaId], (error, facturas) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar la factura.',
                error: error.message
            });
        }

        if (facturas.length === 0) {
            return res.status(404).json({
                mensaje: 'La factura seleccionada no existe.'
            });
        }

        const totalFactura = Number(facturas[0].total);

        const sqlPagado = `
            SELECT COALESCE(SUM(valor), 0) AS total_pagado
            FROM pago
            WHERE id_factura = ?
              AND estado_pago = 'Pagado'
              AND id_pago <> ?
        `;

        conexion.query(
            sqlPagado,
            [facturaId, id],
            (error, resultados) => {
                if (error) {
                    return res.status(500).json({
                        mensaje: 'Error al consultar los pagos anteriores.',
                        error: error.message
                    });
                }

                const totalPagado = Number(resultados[0].total_pagado);
                const saldoPendiente = totalFactura - totalPagado;

                if (
                    estado_pago === 'Pagado' &&
                    monto > saldoPendiente
                ) {
                    return res.status(400).json({
                        mensaje: `El valor supera el saldo pendiente de $${saldoPendiente.toLocaleString('es-CO')}.`
                    });
                }

               const sqlActualizar = `
    UPDATE pago
    SET
        fecha_pago = ?,
        metodo_pago = ?,
        estado_pago = ?,
        tipo_pago = ?,
        valor = ?,
        id_factura = ?
    WHERE id_pago = ?
`;

conexion.query(
    sqlActualizar,
    [
        fecha_pago,
        metodo_pago,
        estado_pago,
        tipo_pago,
        monto,
        facturaId,
        id
    ],
    (error, resultado) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al actualizar el pago.',
                error: error.message
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado.'
            });
        }

        res.status(200).json({
            mensaje: 'Pago actualizado correctamente.'
        });
    }
);
            }
        );
    });
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