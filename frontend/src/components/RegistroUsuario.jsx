
import { useState } from 'react';

const API_URL = 'https://huellitas-vet-production.up.railway.app/api';

function RegistroUsuario({ onVolver }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    correo: '',
    direccion: '',
    contraseña: '',
    rol: 'cliente',
  });

  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensaje('');
    setCargando(true);

    try {
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulario),
      });

      const resultado = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
          resultado.message ||
          'No fue posible registrar el usuario.'
        );
      }

      setTipoMensaje('exito');
      setMensaje(
        resultado.mensaje || 'Usuario registrado correctamente.'
      );

      setFormulario({
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        correo: '',
        direccion: '',
        contraseña: '',
        rol: 'cliente',
      });
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(
        error.message.includes('fetch')
          ? 'No se pudo conectar con el servidor. Verifica que esté activo y que CORS esté configurado.'
          : error.message
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="formulario-panel">
      <h2>Registro de usuarios</h2>
      <p>Ingresa los datos para crear un usuario en Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <div className="campos-grid">
          <label>
            Nombre
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
              maxLength={100}
              autoComplete="given-name"
            />
          </label>

          <label>
            Apellido
            <input
              name="apellido"
              value={formulario.apellido}
              onChange={manejarCambio}
              required
              maxLength={100}
              autoComplete="family-name"
            />
          </label>

          <label>
            Documento
            <input
              name="documento"
              value={formulario.documento}
              onChange={manejarCambio}
              required
              maxLength={30}
            />
          </label>

          <label>
            Teléfono
            <input
              name="telefono"
              type="tel"
              value={formulario.telefono}
              onChange={manejarCambio}
              required
              maxLength={20}
              autoComplete="tel"
            />
          </label>

          <label>
            Correo electrónico
            <input
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={manejarCambio}
              required
              maxLength={150}
              autoComplete="email"
            />
          </label>

          <label>
            Dirección
            <input
              name="direccion"
              value={formulario.direccion}
              onChange={manejarCambio}
              maxLength={200}
              autoComplete="street-address"
            />
          </label>

          <label>
            Contraseña
            <input
              name="contraseña"
              type="password"
              value={formulario.contraseña}
              onChange={manejarCambio}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar usuario'}
          </button>

          <button
            type="button"
            className="boton-secundario"
            onClick={onVolver}
          >
            Volver al inicio
          </button>
        </div>

        {mensaje && (
          <p
            className={`mensaje ${tipoMensaje}`}
            role="status"
            aria-live="polite"
          >
            {mensaje}
          </p>
        )}
      </form>
    </section>
  );
}

export default RegistroUsuario;
