const express = require('express');
const conexion = require('./db');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

//Prueba de conexión a la base de datos
conexion.query('SHOW TABLES', (error, resultados) => {
    if (error) {
        console.log('Error al consultar la tabla en MySQL:', error);
    } else {
        console.log('Tabla encontrada:', resultados);
    }
});

// Importar rutas de autenticación
const authRoutes = require('./rutas/auth');

app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor web Huellitas Vet funcionando'
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});