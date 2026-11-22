
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api';

const formularioInicial = {
  fecha_factura: '',
  precio_unitario: '',
  total: '',
  id_cliente: '',
  id_cita: '',
  id_servicio: '',
};

function GestionFacturas({ onVolver }) {
  const [facturas, setFacturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarFacturas() {
    try {
      const respuesta = await fetch(`${API}/facturas`);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar las facturas.');
      }

      setFacturas(await respuesta.json());
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch(`${API}/facturas`),
      fetch(`${API}/usuarios`),
      fetch(`${API}/citas`),
      fetch(`${API}/servicios`),
    ])
      .then(async ([rFacturas, rUsuarios, rCitas, rServicios]) => {
        if (
          !rFacturas.ok ||
          !rUsuarios.ok ||
          !rCitas.ok ||
          !rServicios.ok
        ) {
          throw new Error('No fue posible cargar todos los datos.');
        }

        return Promise.all([
          rFacturas.json(),
          rUsuarios.json(),
          rCitas.json(),
          rServicios.json(),
        ]);
      })
      .then(([f, u, c, s]) => {
        if (!cancelado) {
          setFacturas(f);
          setUsuarios(u);
          setCitas(c);
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

  function prepararEdicion(factura) {
    setFacturaEditando(factura.id_factura);

    setFormulario({
      fecha_factura: String(factura.fecha_factura).slice(0, 10),
      precio_unitario: factura.precio_unitario,
      total: factura.total,
      id_cliente: String(factura.id_cliente),
      id_cita: String(factura.id_cita),
      id_servicio: String(factura.id_servicio),
    });

    setMensaje(`Editando factura #${factura.id_factura}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setFacturaEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = facturaEditando !== null;

      const respuesta = await fetch(
        editando
          ? `${API}/facturas/${facturaEditando}`
          : `${API}/facturas`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formulario,
            precio_unitario: Number(formulario.precio_unitario),
            total: Number(formulario.total),
            id_cliente: Number(formulario.id_cliente),
            id_cita: Number(formulario.id_cita),
            id_servicio: Number(formulario.id_servicio),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible guardar la factura.'
        );
      }

      setMensaje(
        resultado.mensaje ||
          (editando ? 'Factura actualizada.' : 'Factura registrada.')
      );

      setFormulario(formularioInicial);
      setFacturaEditando(null);
      await cargarFacturas();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarFactura(id) {
    const confirmar = window.confirm(
      '¿Deseas eliminar esta factura?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API}/facturas/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible eliminar la factura.'
        );
      }

      setMensaje('Factura eliminada correctamente.');
      await cargarFacturas();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  function nombreCliente(id) {
    const usuario = usuarios.find(
      (u) => String(u.id_usuario) === String(id)
    );

    return usuario
      ? `${usuario.nombre} ${usuario.apellido || ''}`
      : `ID ${id}`;
  }

  function nombreServicio(id) {
    return servicios.find(
      (s) => String(s.id_servicio) === String(id)
    )?.nombre_servicio || `ID ${id}`;
  }

  const facturasFiltradas = facturas.filter((factura) => {
    const texto = busqueda.toLowerCase();

    return (
      String(factura.id_factura).includes(texto) ||
      nombreCliente(factura.id_cliente).toLowerCase().includes(texto) ||
      String(factura.fecha_factura).slice(0, 10).includes(texto) ||
      nombreServicio(factura.id_servicio).toLowerCase().includes(texto)
    );
  });

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>🧾 Gestión de facturación</h2>
      <p>Administra las facturas de Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>{facturaEditando ? 'Editar factura' : 'Registrar factura'}</h3>

        <div className="campos-grid">
          <label>
            Fecha de facturación
            <input
              type="date"
              name="fecha_factura"
              value={formulario.fecha_factura}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Cliente
            <select
              name="id_cliente"
              value={formulario.id_cliente}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona un cliente</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} {u.apellido} — ID {u.id_usuario}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cita
            <select
              name="id_cita"
              value={formulario.id_cita}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona una cita</option>
              {citas.map((c) => (
                <option key={c.id_cita} value={c.id_cita}>
                  Cita #{c.id_cita} — {String(c.fecha).slice(0, 10)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Servicio
            <select
              name="id_servicio"
              value={formulario.id_servicio}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option key={s.id_servicio} value={s.id_servicio}>
                  {s.nombre_servicio}
                </option>
              ))}
            </select>
          </label>

          <label>
            Precio unitario
            <input
              type="number"
              name="precio_unitario"
              min="0"
              step="0.01"
              value={formulario.precio_unitario}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Total de la factura
            <input
              type="number"
              name="total"
              min="0"
              step="0.01"
              value={formulario.total}
              onChange={manejarCambio}
              required
            />
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando
              ? 'Guardando...'
              : facturaEditando
                ? 'Actualizar factura'
                : 'Registrar factura'}
          </button>

          {facturaEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Facturas registradas ({facturas.length})</h3>

        <input
          type="search"
          placeholder="Buscar por código, cliente, fecha o servicio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {facturasFiltradas.length === 0 ? (
          <p>No se encontraron facturas.</p>
        ) : (
          facturasFiltradas.map((factura) => (
            <article className="usuario-tarjeta" key={factura.id_factura}>
              <div>
                <strong>Factura #{factura.id_factura}</strong>
                <p>Fecha: {String(factura.fecha_factura).slice(0, 10)}</p>
                <p>Cliente: {nombreCliente(factura.id_cliente)}</p>
                <p>Cita: #{factura.id_cita}</p>
                <p>Servicio: {nombreServicio(factura.id_servicio)}</p>
                <p>
                  Precio unitario: $
                  {Number(factura.precio_unitario).toLocaleString('es-CO')}
                </p>
                <p>
                  Total: $
                  {Number(factura.total).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="acciones-usuario">
                <button
                  type="button"
                  onClick={() => prepararEdicion(factura)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarFactura(factura.id_factura)}
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

export default GestionFacturas;
