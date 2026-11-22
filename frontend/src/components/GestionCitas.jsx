
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api/citas';

const formularioInicial = {
  fecha: '',
  hora: '',
  estado: 'Pendiente',
  motivo: '',
  id_mascota: '',
  id_veterinario: '',
  id_servicio: '',
};

function GestionCitas({ onVolver }) {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [citaEditando, setCitaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarCitas() {
    try {
      const respuesta = await fetch(`${API}/citas`);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar las citas.');
      }

      setCitas(await respuesta.json());
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch(`${API}/citas`),
      fetch(`${API}/mascotas`),
      fetch(`${API}/veterinarios`),
      fetch(`${API}/servicios`),
    ])
      .then(async ([rCitas, rMascotas, rVeterinarios, rServicios]) => {
        if (
          !rCitas.ok ||
          !rMascotas.ok ||
          !rVeterinarios.ok ||
          !rServicios.ok
        ) {
          throw new Error('No fue posible cargar todos los datos.');
        }

        return Promise.all([
          rCitas.json(),
          rMascotas.json(),
          rVeterinarios.json(),
          rServicios.json(),
        ]);
      })
      .then(([c, m, v, s]) => {
        if (!cancelado) {
          setCitas(c);
          setMascotas(m);
          setVeterinarios(v);
          setServicios(s);
        }
      })
      .catch((error) => {
        if (!cancelado) setMensaje(error.message);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  function manejarCambio(e) {
    setFormulario((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
  }

  function prepararEdicion(cita) {
    setCitaEditando(cita.id_cita);

    setFormulario({
      fecha: String(cita.fecha).slice(0, 10),
      hora: String(cita.hora).slice(0, 5),
      estado: cita.estado || 'Pendiente',
      motivo: cita.motivo || '',
      id_mascota: String(cita.id_mascota),
      id_veterinario: String(cita.id_veterinario),
      id_servicio: String(cita.id_servicio),
    });

    setMensaje(`Editando cita #${cita.id_cita}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setCitaEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = citaEditando !== null;

      const respuesta = await fetch(
        editando ? `${API}/citas/${citaEditando}` : `${API}/citas`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formulario,
            id_mascota: Number(formulario.id_mascota),
            id_veterinario: Number(formulario.id_veterinario),
            id_servicio: Number(formulario.id_servicio),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No fue posible guardar la cita.');
      }

      setMensaje(
        resultado.mensaje ||
          (editando ? 'Cita actualizada.' : 'Cita registrada.')
      );

      setFormulario(formularioInicial);
      setCitaEditando(null);
      await cargarCitas();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function cancelarCita(id) {
  const confirmar = window.confirm(
    '¿Deseas cancelar esta cita?'
  );

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API}/citas/${id}/cancelar`, {
      method: 'PATCH',
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje || 'No fue posible cancelar la cita.'
      );
    }

    setMensaje('Cita cancelada correctamente.');
    await cargarCitas();

  } catch (error) {
    setMensaje(error.message);
  }
}

  const citasFiltradas = citas.filter((cita) => {
    const mascota = mascotas.find(
      (m) => m.id_mascota === cita.id_mascota
    );

    const texto = busqueda.toLowerCase();

    return (
      String(cita.id_cita).includes(texto) ||
      String(mascota?.nombre || '').toLowerCase().includes(texto) ||
      String(cita.fecha).slice(0, 10).includes(texto) ||
      String(cita.estado).toLowerCase().includes(texto)
    );
  });

  function nombreMascota(id) {
    return mascotas.find((m) => m.id_mascota === id)?.nombre || `ID ${id}`;
  }

  function nombreVeterinario(id) {
    const v = veterinarios.find((v) => v.id_veterinario === id);
    return v ? `${v.nombre} ${v.apellido}` : `ID ${id}`;
  }

  function nombreServicio(id) {
    return servicios.find((s) => s.id_servicio === id)?.nombre_servicio || `ID ${id}`;
  }

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>📅 Gestión de citas</h2>
      <p>Administra las citas veterinarias de Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>{citaEditando ? 'Editar cita' : 'Registrar cita'}</h3>

        <div className="campos-grid">
          <label>
            Mascota
            <select name="id_mascota" value={formulario.id_mascota}
              onChange={manejarCambio} required>
              <option value="">Selecciona una mascota</option>
              {mascotas.map((m) => (
                <option key={m.id_mascota} value={m.id_mascota}>
                  {m.nombre} — código {m.id_mascota}
                </option>
              ))}
            </select>
          </label>

          <label>
            Veterinario
            <select name="id_veterinario" value={formulario.id_veterinario}
              onChange={manejarCambio} required>
              <option value="">Selecciona un veterinario</option>
              {veterinarios.map((v) => (
                <option key={v.id_veterinario} value={v.id_veterinario}>
                  {v.nombre} {v.apellido}
                </option>
              ))}
            </select>
          </label>

          <label>
            Servicio
            <select name="id_servicio" value={formulario.id_servicio}
              onChange={manejarCambio} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option key={s.id_servicio} value={s.id_servicio}>
                  {s.nombre_servicio}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha
            <input type="date" name="fecha" value={formulario.fecha}
              onChange={manejarCambio} required />
          </label>

          <label>
            Hora
            <input type="time" name="hora" value={formulario.hora}
              onChange={manejarCambio} required />
          </label>

          <label>
            Estado
            <select name="estado" value={formulario.estado}
              onChange={manejarCambio} required>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Atendida">Atendida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </label>

          <label>
            Motivo de la consulta
            <textarea name="motivo" value={formulario.motivo}
              onChange={manejarCambio} rows="3" />
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' :
              citaEditando ? 'Actualizar cita' : 'Registrar cita'}
          </button>

          {citaEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Citas registradas ({citas.length})</h3>

        <input
          type="search"
          placeholder="Buscar por código, mascota, fecha o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {citasFiltradas.length === 0 ? (
          <p>No se encontraron citas.</p>
        ) : (
          citasFiltradas.map((cita) => (
            <article className="usuario-tarjeta" key={cita.id_cita}>
              <div>
                <strong>Cita #{cita.id_cita}</strong>
                <p>Mascota: {nombreMascota(cita.id_mascota)}</p>
                <p>Veterinario: {nombreVeterinario(cita.id_veterinario)}</p>
                <p>Servicio: {nombreServicio(cita.id_servicio)}</p>
                <p>Fecha: {String(cita.fecha).slice(0, 10)}</p>
                <p>Hora: {String(cita.hora).slice(0, 5)}</p>
                <p>Estado: {cita.estado}</p>
                <p>Motivo: {cita.motivo || 'No especificado'}</p>
              </div>

              <div className="acciones-usuario">
                <button type="button" onClick={() => prepararEdicion(cita)}>
                  Editar
                </button>

                {cita.estado !== 'Cancelada' && (
                  <button
                    type="button"
                    className="boton-eliminar"
                    onClick={() => cancelarCita(cita.id_cita)}
                  >
                    Cancelar cita
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <button type="button" onClick={onVolver}>
        Volver al inicio
      </button>
    </section>
  );
}

export default GestionCitas;
