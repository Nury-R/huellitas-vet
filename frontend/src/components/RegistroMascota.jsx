import { useState } from 'react';
const API_URL = `http://${window.location.hostname}:3000/api/mascotas`;
function RegistroMascota({ onVolver }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    sexo: '',
    peso: '',
    id_usuario: '',
  });

  const [mensaje, setMensaje] = useState('');

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
    setMensaje('');
  };

  

const manejarEnvio = async (e) => {
  e.preventDefault();
  setMensaje('Registrando mascota...');

  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formulario,
        peso: Number(formulario.peso),
        id_usuario: Number(formulario.id_usuario),
      }),
    });

    const datos = await respuesta.json();

    console.log('Respuesta del servidor:', respuesta.status, datos);

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudo registrar la mascota');
    }

    setMensaje(
      `¡Mascota registrada correctamente! Código: ${datos.id_mascota}`
    );

    setFormulario({
      nombre: '',
      especie: '',
      raza: '',
      fecha_nacimiento: '',
      sexo: '',
      peso: '',
      id_usuario: '',
    });

  } catch (error) {
    console.error('Error al registrar mascota:', error);
    setMensaje(
      `No se pudo registrar: ${error.message}. Verifica que el servidor esté funcionando.`
    );
  }
};

  return (
    <section className="panel">
      <h2>🐾 Registrar mascota</h2>
      <p>Ingresa los datos de tu mascota.</p>

      <form onSubmit={manejarEnvio} className="formulario">
        <label htmlFor="nombre">Nombre de la mascota</label>
        <input
          id="nombre"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />

        <label htmlFor="especie">Especie</label>
        <select
          id="especie"
          name="especie"
          value={formulario.especie}
          onChange={manejarCambio}
          required
        >
          <option value="">Selecciona una especie</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>

        <label htmlFor="raza">Raza</label>
        <input
          id="raza"
          name="raza"
          value={formulario.raza}
          onChange={manejarCambio}
          required
        />

        <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
        <input
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          type="date"
          value={formulario.fecha_nacimiento}
          onChange={manejarCambio}
          required
        />

        <label htmlFor="sexo">Sexo</label>
        <select
          id="sexo"
          name="sexo"
          value={formulario.sexo}
          onChange={manejarCambio}
          required
        >
          <option value="">Selecciona</option>
          <option value="Macho">Macho</option>
          <option value="Hembra">Hembra</option>
        </select>

        <label htmlFor="peso">Peso en kilogramos</label>
        <input
          id="peso"
          name="peso"
          type="number"
          min="0.01"
          step="0.01"
          value={formulario.peso}
          onChange={manejarCambio}
          required
        />

        <label htmlFor="id_usuario">Identificación del propietario</label>
        <input
          id="id_usuario"
          name="id_usuario"
          type="number"
          min="1"
          value={formulario.id_usuario}
          onChange={manejarCambio}
          required
        />

        <button type="submit">Preparar registro</button>
        <button type="button" onClick={onVolver}>
          Volver al inicio
        </button>

        {mensaje && <p role="status">{mensaje}</p>}
      </form>
    </section>
  );
}

export default RegistroMascota;