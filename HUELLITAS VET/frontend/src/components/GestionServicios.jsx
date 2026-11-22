import { useEffect, useState } from 'react';

const API_URL = `http://${window.location.hostname}:3000/api/servicios`;

const formularioInicial = {
  nombre_servicio: '',
  descripcion: '',
  costo: '',
};

function GestionServicios({ onVolver }) {
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarServicios() {
    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar los servicios.');
      }

      const datos = await respuesta.json();
      setServicios(datos);
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
    let cancelado = false;

    fetch(API_URL)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No fue posible consultar los servicios.');
        }

        return respuesta.json();
      })
      .then((datos) => {
        if (!cancelado) {
          setServicios(datos);
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

  function prepararEdicion(servicio) {
    setServicioEditando(servicio.id_servicio);

    setFormulario({
      nombre_servicio: servicio.nombre_servicio || '',
      descripcion: servicio.descripcion || '',
      costo: servicio.costo ?? '',
    });

    setMensaje(`Editando servicio #${servicio.id_servicio}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setServicioEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = servicioEditando !== null;

      const respuesta = await fetch(
        editando ? `${API_URL}/${servicioEditando}` : API_URL,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formulario,
            costo: Number(formulario.costo),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible guardar el servicio.'
        );
      }

      setMensaje(
        resultado.mensaje ||
          (editando
            ? 'Servicio actualizado correctamente.'
            : 'Servicio registrado correctamente.')
      );

      setFormulario(formularioInicial);
      setServicioEditando(null);

      await cargarServicios();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarServicio(id) {
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas eliminar este servicio?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible eliminar el servicio.'
        );
      }

      setMensaje(resultado.mensaje);
      await cargarServicios();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  const serviciosFiltrados = servicios.filter((servicio) => {
    const texto = busqueda.toLowerCase();

    return (
      String(servicio.nombre_servicio).toLowerCase().includes(texto) ||
      String(servicio.descripcion || '').toLowerCase().includes(texto)
    );
  });

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>🩺 Gestión de servicios veterinarios</h2>
      <p>Administra los servicios de Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>
          {servicioEditando ? 'Editar servicio' : 'Registrar servicio'}
        </h3>

        <div className="campos-grid">
          <label>
            Nombre del servicio
            <input
              name="nombre_servicio"
              value={formulario.nombre_servicio}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows="3"
            />
          </label>

          <label>
            Costo en pesos colombianos
            <input
              type="number"
              name="costo"
              min="0"
              step="0.01"
              value={formulario.costo}
              onChange={manejarCambio}
              required
            />
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando
              ? 'Guardando...'
              : servicioEditando
                ? 'Actualizar servicio'
                : 'Registrar servicio'}
          </button>

          {servicioEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Servicios registrados ({servicios.length})</h3>

        <input
          type="search"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {serviciosFiltrados.length === 0 ? (
          <p>No se encontraron servicios.</p>
        ) : (
          serviciosFiltrados.map((servicio) => (
            <article
              className="usuario-tarjeta"
              key={servicio.id_servicio}
            >
              <div>
                <strong>{servicio.nombre_servicio}</strong>
                <p>Código: {servicio.id_servicio}</p>
                <p>Descripción: {servicio.descripcion || 'Sin descripción'}</p>
                <p>
                  Costo: $
                  {Number(servicio.costo).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="acciones-usuario">
                <button
                  type="button"
                  onClick={() => prepararEdicion(servicio)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarServicio(servicio.id_servicio)}
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

export default GestionServicios;
