
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api/citas';

function ConsultarCitas({ onVolver }) {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuestas = await Promise.all([
          fetch(`${API}/citas`),
          fetch(`${API}/mascotas`),
          fetch(`${API}/veterinarios`),
          fetch(`${API}/servicios`),
        ]);

        if (respuestas.some((r) => !r.ok)) {
          throw new Error('No se pudieron consultar todos los datos.');
        }

        const [c, m, v, s] = await Promise.all(
          respuestas.map((r) => r.json())
        );

        setCitas(c);
        setMascotas(m);
        setVeterinarios(v);
        setServicios(s);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las citas. Revisa la conexión.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const buscarNombre = (lista, campoId, id, campoNombre) => {
  const registro = lista.find(
    (item) => String(item[campoId]) === String(id)
  );

  return registro
    ? registro[campoNombre]
    : `Código ${id} (registro no encontrado)`;
};

  const formatoFecha = (fecha) => {
    const valor = String(fecha).slice(0, 10);
    const partes = valor.split('-');
    return partes.length === 3
      ? `${partes[2]}/${partes[1]}/${partes[0]}`
      : valor;
  };

  return (
    <section className="panel">
      <h2>🗓️ Citas registradas</h2>

      {cargando && <p>Cargando citas...</p>}
      {error && <p role="alert">{error}</p>}

      {!cargando && !error && citas.length === 0 && (
        <p>No hay citas registradas.</p>
      )}

      {!cargando && !error && citas.map((cita) => (
        <article className="tarjeta-mascota" key={cita.id_cita}>
          <h3>Cita #{cita.id_cita}</h3>
          <p><strong>Mascota:</strong>{' '}
            {buscarNombre(mascotas, 'id_mascota', cita.id_mascota, 'nombre')}
          </p>
          <p><strong>Veterinario:</strong>{' '}
            {(() => {
              const vet = veterinarios.find(
                (v) => v.id_veterinario === cita.id_veterinario
              );
              return vet
                ? `${vet.nombre} ${vet.apellido}`
                : `Código ${cita.id_veterinario}`;
            })()}
          </p>
          <p><strong>Servicio:</strong>{' '}
            {buscarNombre(servicios, 'id_servicio', cita.id_servicio, 'nombre_servicio')}
          </p>
          <p><strong>Fecha:</strong> {formatoFecha(cita.fecha)}</p>
          <p><strong>Hora:</strong> {String(cita.hora).slice(0, 5)}</p>
          <p><strong>Estado:</strong> {cita.estado}</p>
          <p><strong>Motivo:</strong> {cita.motivo || 'No especificado'}</p>
        </article>
      ))}

      <button onClick={onVolver}>Volver al inicio</button>
    </section>
  );
}

export default ConsultarCitas;
