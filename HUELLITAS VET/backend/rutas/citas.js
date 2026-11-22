const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo citas.js cargado correctamente');

// ======================================================
// OBTENER TODAS LAS CITAS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_cita,
            fecha,
            hora,
            estado,
            motivo,
            id_mascota,
            id_veterinario,
            id_servicio
        FROM cita
    `;

    conexion.query(sql, (error, resultados) => {

       if (error) {
    console.error('Error al consultar citas:', error);

    return res.status(500).json({
        mensaje: 'Error al consultar las citas',
        error: error.message,
        codigo: error.code
    });
}

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UNA CITA POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_cita,
            fecha,
            hora,
            estado,
            motivo,
            id_mascota,
            id_veterinario,
            id_servicio
        FROM cita
        WHERE id_cita = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar cita:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la cita'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR CITA
// ======================================================

router.post('/', (req, res) => {

    const {
        fecha,
        hora,
        estado,
        motivo,
        id_mascota,
        id_veterinario,
        id_servicio
    } = req.body;

    if (
        !fecha ||
        !hora ||
        !estado ||
        !id_mascota ||
        !id_veterinario ||
        !id_servicio
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        INSERT INTO cita
        (
            fecha,
            hora,
            estado,
            motivo,
            id_mascota,
            id_veterinario,
            id_servicio
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            fecha,
            hora,
            estado,
            motivo || null,
            id_mascota,
            id_veterinario,
            id_servicio
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar cita:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar la cita',
                    error: error.message,
                    codigo: error.code
                });
            }

            res.status(201).json({
                mensaje: 'Cita registrada correctamente',
                id_cita: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR CITA
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        fecha,
        hora,
        estado,
        motivo,
        id_mascota,
        id_veterinario,
        id_servicio
    } = req.body;

    if (
        !fecha ||
        !hora ||
        !estado ||
        !id_mascota ||
        !id_veterinario ||
        !id_servicio
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos obligatorios deben ser diligenciados'
        });
    }

    const sql = `
        UPDATE cita
        SET
            fecha = ?,
            hora = ?,
            estado = ?,
            motivo = ?,
            id_mascota = ?,
            id_veterinario = ?,
            id_servicio = ?
        WHERE id_cita = ?
    `;

    conexion.query(
        sql,
        [
            fecha,
            hora,
            estado,
            motivo || null,
            id_mascota,
            id_veterinario,
            id_servicio,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar cita:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar la cita'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Cita no encontrada'
                });
            }

            res.status(200).json({
                mensaje: 'Cita actualizada correctamente'
            });
        }
    );
});
// ======================================================
// CANCELAR CITA
// ======================================================

router.patch('/:id/cancelar', (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE cita
        SET estado = 'Cancelada'
        WHERE id_cita = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al cancelar cita:', error);

            return res.status(500).json({
                mensaje: 'Error al cancelar la cita',
                error: error.message
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Cita cancelada correctamente'
        });
    });
});

// ======================================================
// ELIMINAR CITA
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM cita
        WHERE id_cita = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar cita:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar la cita'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Cita no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Cita eliminada correctamente'
        });
    });
});


module.exports = router;