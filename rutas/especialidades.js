const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo especialidades.js cargado correctamente');

// ======================================================
// OBTENER TODAS LAS ESPECIALIDADES
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_especialidad,
            nombre_especialidad,
            descripcion
        FROM especialidad
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('Error al consultar especialidades:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar las especialidades'
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UNA ESPECIALIDAD POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_especialidad,
            nombre_especialidad,
            descripcion
        FROM especialidad
        WHERE id_especialidad = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('Error al consultar especialidad:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la especialidad'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Especialidad no encontrada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR ESPECIALIDAD
// ======================================================

router.post('/', (req, res) => {

    const {
        nombre_especialidad,
        descripcion
    } = req.body;

    if (!nombre_especialidad) {
        return res.status(400).json({
            mensaje: 'El nombre de la especialidad es obligatorio'
        });
    }

    const sql = `
        INSERT INTO especialidad
        (
            nombre_especialidad,
            descripcion
        )
        VALUES (?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre_especialidad,
            descripcion || null
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al registrar especialidad:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar la especialidad'
                });
            }

            res.status(201).json({
                mensaje: 'Especialidad registrada correctamente',
                id_especialidad: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR ESPECIALIDAD
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre_especialidad,
        descripcion
    } = req.body;

    if (!nombre_especialidad) {
        return res.status(400).json({
            mensaje: 'El nombre de la especialidad es obligatorio'
        });
    }

    const sql = `
        UPDATE especialidad
        SET
            nombre_especialidad = ?,
            descripcion = ?
        WHERE id_especialidad = ?
    `;

    conexion.query(
        sql,
        [
            nombre_especialidad,
            descripcion || null,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar especialidad:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar la especialidad'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Especialidad no encontrada'
                });
            }

            res.status(200).json({
                mensaje: 'Especialidad actualizada correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR ESPECIALIDAD
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM especialidad
        WHERE id_especialidad = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('Error al eliminar especialidad:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar la especialidad'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Especialidad no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Especialidad eliminada correctamente'
        });
    });
});


module.exports = router;