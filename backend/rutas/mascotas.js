const express = require('express');
const conexion = require('../db');

const router = express.Router();

console.log('Archivo mascotas.js cargado correctamente');

// ======================================================
// OBTENER TODAS LAS MASCOTAS
// ======================================================

router.get('/', (req, res) => {

    const sql = `
        SELECT
            id_mascota,
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            sexo,
            peso,
            id_usuario
        FROM mascota
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error('ERROR REAL DE MYSQL:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar las mascotas',
                error: error.message,
                codigo: error.code
            });
        }

        res.status(200).json(resultados);
    });
});


// ======================================================
// OBTENER UNA MASCOTA POR ID
// ======================================================

router.get('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id_mascota,
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            sexo,
            peso,
            id_usuario
        FROM mascota
        WHERE id_mascota = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error('ERROR REAL DE MYSQL:', error);

            return res.status(500).json({
                mensaje: 'Error al consultar la mascota',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: 'Mascota no encontrada'
            });
        }

        res.status(200).json(resultados[0]);
    });
});


// ======================================================
// CREAR MASCOTA
// ======================================================

router.post('/', (req, res) => {

    const {
        nombre,
        especie,
        raza,
        fecha_nacimiento,
        sexo,
        peso,
        id_usuario
    } = req.body;

    // Validar campos obligatorios
    if (
        !nombre ||
        !especie ||
        !raza ||
        !fecha_nacimiento ||
        !sexo ||
        peso === undefined ||
        !id_usuario
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }

    const sql = `
        INSERT INTO mascota
        (
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            sexo,
            peso,
            id_usuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            sexo,
            peso,
            id_usuario
        ],
        (error, resultado) => {

            if (error) {
                console.error('ERROR REAL DE MYSQL:', error);

                return res.status(500).json({
                    mensaje: 'Error al registrar la mascota',
                    error: error.message,
                    codigo: error.code
                });
            }

            res.status(201).json({
                mensaje: 'Mascota registrada correctamente',
                id_mascota: resultado.insertId
            });
        }
    );
});


// ======================================================
// ACTUALIZAR MASCOTA
// ======================================================

router.put('/:id', (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        especie,
        raza,
        fecha_nacimiento,
        sexo,
        peso,
        id_usuario
    } = req.body;

    const sql = `
        UPDATE mascota
        SET
            nombre = ?,
            especie = ?,
            raza = ?,
            fecha_nacimiento = ?,
            sexo = ?,
            peso = ?,
            id_usuario = ?
        WHERE id_mascota = ?
    `;

    conexion.query(
        sql,
        [
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            sexo,
            peso,
            id_usuario,
            id
        ],
        (error, resultado) => {

            if (error) {
                console.error('ERROR REAL DE MYSQL:', error);

                return res.status(500).json({
                    mensaje: 'Error al actualizar la mascota',
                    error: error.message,
                    codigo: error.code
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: 'Mascota no encontrada'
                });
            }

            res.status(200).json({
                mensaje: 'Mascota actualizada correctamente'
            });
        }
    );
});


// ======================================================
// ELIMINAR MASCOTA
// ======================================================

router.delete('/:id', (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM mascota
        WHERE id_mascota = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {

        if (error) {
            console.error('ERROR REAL DE MYSQL:', error);

            return res.status(500).json({
                mensaje: 'Error al eliminar la mascota',
                error: error.message,
                codigo: error.code
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Mascota no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Mascota eliminada correctamente'
        });
    });
});


module.exports = router;