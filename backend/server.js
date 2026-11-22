const express = require('express');
const conexion = require('./db');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Prueba de conexión a la base de datos
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

// Importar rutas de usuarios
const usuariosRoutes = require('./rutas/usuarios');

app.use('/api/usuarios', usuariosRoutes);

// Importar rutas de mascotas
const mascotasRoutes = require('./rutas/mascotas');

app.use('/api/mascotas', mascotasRoutes);

// Importar rutas de especialidades
const especialidadesRoutes = require('./rutas/especialidades');

app.use('/api/especialidades', especialidadesRoutes);

// Importar rutas de veterinarios
const veterinariosRoutes = require('./rutas/veterinarios');

app.use('/api/veterinarios', veterinariosRoutes);

// Importar rutas de servicios
const serviciosRoutes = require('./rutas/servicios');

app.use('/api/servicios', serviciosRoutes);

console.log('RUTA DE MASCOTAS REGISTRADA');
console.log(mascotasRoutes);

// Importar rutas de citas
const citasRoutes = require('./rutas/citas');

app.use('/api/citas', citasRoutes);

// Importar rutas de facturas
const facturasRoutes = require('./rutas/facturas');

app.use('/api/facturas', facturasRoutes);

// Importar rutas de pagos
const pagosRoutes = require('./rutas/pagos');

app.use('/api/pagos', pagosRoutes);

// Importar rutas de notificaciones
const notificacionesRoutes = require('./rutas/notificaciones');

app.use('/api/notificaciones', notificacionesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor web Huellitas Vet funcionando'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});