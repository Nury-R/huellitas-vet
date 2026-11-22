
import { useEffect, useState } from 'react';

const API = `http://${window.location.hostname}:3000/api`;

function SolicitarCita({ onVolver }) {
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  const [formulario, setFormulario] = useState({
    fecha: '',
    hora: '',
    motivo: '',
    id_mascota: '',
    id_veterinario: '',
    id_servicio: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rMascotas, rVeterinarios, rServicios] =
          await Promise.all([
            fetch(`${API}/mascotas`),
            fetch(`${API}/veterinarios`),
            fetch(`${API}/servicios`),
          ]);

        if (!rMascotas.ok || !rVeterinarios.ok || !rServicios.ok) {
          throw new Error('No fue posible cargar todos los datos.');
        }

        const [m, v, s] = await Promise.all([
          rMascotas.json(),
          rVeterinarios.json(),
          rServicios.json(),
        ]);

        setMascotas(m);
        setVeterinarios(v);
        setServicios(s);
      } catch (error) {
        console.error(error);
        setMensaje(
          'No se pudieron cargar los datos. Verifica que el backend esté activo y accesible.'
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
    setMensaje('');
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje('Registrando cita...');

    try {
      const respuesta = await fetch(`${API}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          estado: 'Pendiente',
          id_mascota: Number(formulario.id_mascota),
          id_veterinario: Number(formulario.id_veterinario),
          id_servicio: Number(formulario.id_servicio),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo registrar la cita.');
      }

      setMensaje(
        `¡Cita registrada correctamente! Código: ${datos.id_cita}`
      );

      setFormulario({
        fecha: '',
        hora: '',
        motivo: '',
        id_mascota: '',
        id_veterinario: '',
        id_servicio: '',
      });
    } catch (error) {
      console.error('Error al registrar cita:', error);
      setMensaje(`No se pudo registrar la cita: ${error.message}`);
    }
  };

  return (
    <section className="panel">
      <h2>📅 Solicitar cita</h2>
      <p>Selecciona la mascota, el veterinario y el servicio.</p>

      {cargando ? (
        <p>Cargando mascotas, veterinarios y servicios...</p>
      ) : (
        <form className="formulario" onSubmit={manejarEnvio}>
          <label htmlFor="id_mascota">Mascota</label>
          <select
            id="id_mascota"
            name="id_mascota"
            value={formulario.id_mascota}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona una mascota</option>
            {mascotas.map((m) => (
              <option key={m.id_mascota} value={m.id_mascota}>
                {m.nombre} — código {m.id_mascota}
              </option>
            ))}
          </select>

          <label htmlFor="id_veterinario">Veterinario</label>
          <select
            id="id_veterinario"
            name="id_veterinario"
            value={formulario.id_veterinario}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un veterinario</option>
            {veterinarios.map((v) => (
              <option key={v.id_veterinario} value={v.id_veterinario}>
                {v.nombre} {v.apellido}
              </option>
            ))}
          </select>

          <label htmlFor="id_servicio">Servicio</label>
          <select
            id="id_servicio"
            name="id_servicio"
            value={formulario.id_servicio}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre_servicio} — $
                {Number(s.costo).toLocaleString('es-CO')}
              </option>
            ))}
          </select>

          <label htmlFor="fecha">Fecha de la cita</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            min={new Date().toLocaleDateString('en-CA')}
            value={formulario.fecha}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="hora">Hora de la cita</label>
          <input
            id="hora"
            name="hora"
            type="time"
            value={formulario.hora}
            onChange={manejarCambio}
            required
          />

          <label htmlFor="motivo">Motivo de la consulta</label>
          <textarea
            id="motivo"
            name="motivo"
            value={formulario.motivo}
            onChange={manejarCambio}
            placeholder="Describe brevemente el motivo"
            rows="3"
          />

          <button type="submit">Solicitar cita</button>
          <button type="button" onClick={onVolver}>
            Volver al inicio
          </button>

          {mensaje && <p role="status">{mensaje}</p>}
        </form>
      )}
    </section>
  );
}

export default SolicitarCita;
