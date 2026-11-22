
import { useEffect, useState } from 'react';

const API_URL = 'https://huellitas-vet-production.up.railway.app/api/mascotas';

const formularioInicial = {
  nombre: '',
  especie: '',
  raza: '',
  fecha_nacimiento: '',
  sexo: '',
  peso: '',
  id_usuario: '',
};

function GestionMascotas({ onVolver }) {
  const [mascotas, setMascotas] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [mascotaEditando, setMascotaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarMascotas() {
    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar las mascotas.');
      }

      const datos = await respuesta.json();
      setMascotas(datos);
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
    let cancelado = false;

    fetch(API_URL)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No fue posible consultar las mascotas.');
        }
        return respuesta.json();
      })
      .then((datos) => {
        if (!cancelado) setMascotas(datos);
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

  function prepararEdicion(mascota) {
    setMascotaEditando(mascota.id_mascota);

    setFormulario({
      nombre: mascota.nombre || '',
      especie: mascota.especie || '',
      raza: mascota.raza || '',
      fecha_nacimiento: mascota.fecha_nacimiento
        ? String(mascota.fecha_nacimiento).slice(0, 10)
        : '',
      sexo: mascota.sexo || '',
      peso: mascota.peso ?? '',
      id_usuario: mascota.id_usuario || '',
    });

    setMensaje(`Editando mascota #${mascota.id_mascota}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setMascotaEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = mascotaEditando !== null;

      const respuesta = await fetch(
        editando ? `${API_URL}/${mascotaEditando}` : API_URL,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formulario,
            peso: Number(formulario.peso),
            id_usuario: Number(formulario.id_usuario),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible guardar la mascota.'
        );
      }

      setMensaje(
        resultado.mensaje ||
          (editando
            ? 'Mascota actualizada correctamente.'
            : 'Mascota registrada correctamente.')
      );

      setFormulario(formularioInicial);
      setMascotaEditando(null);
      await cargarMascotas();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarMascota(id) {
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas eliminar esta mascota?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible eliminar la mascota.'
        );
      }

      setMensaje(resultado.mensaje);
      await cargarMascotas();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const texto = busqueda.toLowerCase();

    return (
      String(mascota.nombre).toLowerCase().includes(texto) ||
      String(mascota.especie).toLowerCase().includes(texto) ||
      String(mascota.raza).toLowerCase().includes(texto)
    );
  });

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>🐾 Gestión de mascotas</h2>
      <p>Administra las mascotas registradas en Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>{mascotaEditando ? 'Editar mascota' : 'Registrar mascota'}</h3>

        <div className="campos-grid">
          <label>
            Nombre
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Especie
            <select
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
          </label>

          <label>
            Raza
            <input
              name="raza"
              value={formulario.raza}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Fecha de nacimiento
            <input
              type="date"
              name="fecha_nacimiento"
              value={formulario.fecha_nacimiento}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Sexo
            <select
              name="sexo"
              value={formulario.sexo}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </label>

          <label>
            Peso en kilogramos
            <input
              type="number"
              name="peso"
              min="0.01"
              step="0.01"
              value={formulario.peso}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            ID del propietario
            <input
              type="number"
              name="id_usuario"
              min="1"
              value={formulario.id_usuario}
              onChange={manejarCambio}
              required
            />
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando
              ? 'Guardando...'
              : mascotaEditando
                ? 'Actualizar mascota'
                : 'Registrar mascota'}
          </button>

          {mascotaEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Mascotas registradas ({mascotas.length})</h3>

        <input
          type="search"
          placeholder="Buscar por nombre, especie o raza..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {mascotasFiltradas.length === 0 ? (
          <p>No se encontraron mascotas.</p>
        ) : (
          mascotasFiltradas.map((mascota) => (
            <article
              className="usuario-tarjeta"
              key={mascota.id_mascota}
            >
              <div>
                <strong>{mascota.nombre}</strong>
                <p>Código: {mascota.id_mascota}</p>
                <p>Especie: {mascota.especie}</p>
                <p>Raza: {mascota.raza}</p>
                <p>Fecha de nacimiento: {String(mascota.fecha_nacimiento).slice(0, 10)}</p>
                <p>Sexo: {mascota.sexo}</p>
                <p>Peso: {mascota.peso} kg</p>
                <p>ID del propietario: {mascota.id_usuario}</p>
              </div>

              <div className="acciones-usuario">
                <button
                  type="button"
                  onClick={() => prepararEdicion(mascota)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarMascota(mascota.id_mascota)}
                >
                  Eliminar
                </button>
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

export default GestionMascotas;
