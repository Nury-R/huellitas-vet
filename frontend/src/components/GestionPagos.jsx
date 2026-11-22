
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api';

const formularioInicial = {
  fecha_pago: '',
  metodo_pago: '',
  estado_pago: 'Pendiente',
  valor: '',
  id_factura: '',
};

function GestionPagos({ onVolver }) {
  const [pagos, setPagos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [pagoEditando, setPagoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarPagos() {
    try {
      const respuesta = await fetch(`${API}/pagos`);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar los pagos.');
      }

      setPagos(await respuesta.json());
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetch(`${API}/pagos`),
      fetch(`${API}/facturas`),
    ])
      .then(async ([rPagos, rFacturas]) => {
        if (!rPagos.ok || !rFacturas.ok) {
          throw new Error('No fue posible cargar los datos.');
        }

        return Promise.all([
          rPagos.json(),
          rFacturas.json(),
        ]);
      })
      .then(([p, f]) => {
        if (!cancelado) {
          setPagos(p);
          setFacturas(f);
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

  function prepararEdicion(pago) {
    setPagoEditando(pago.id_pago);

    setFormulario({
      fecha_pago: String(pago.fecha_pago).slice(0, 10),
      metodo_pago: pago.metodo_pago,
      estado_pago: pago.estado_pago,
      valor: pago.valor,
      id_factura: String(pago.id_factura),
    });

    setMensaje(`Editando pago #${pago.id_pago}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setPagoEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = pagoEditando !== null;

      const respuesta = await fetch(
        editando
          ? `${API}/pagos/${pagoEditando}`
          : `${API}/pagos`,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formulario,
            valor: Number(formulario.valor),
            id_factura: Number(formulario.id_factura),
          }),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible guardar el pago.'
        );
      }

      setMensaje(
        resultado.mensaje ||
          (editando ? 'Pago actualizado.' : 'Pago registrado.')
      );

      setFormulario(formularioInicial);
      setPagoEditando(null);
      await cargarPagos();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarPago(id) {
    const confirmar = window.confirm(
      '¿Deseas eliminar este pago?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API}/pagos/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No fue posible eliminar el pago.'
        );
      }

      setMensaje('Pago eliminado correctamente.');
      await cargarPagos();
    } catch (error) {
      setMensaje(error.message);
    }
  }
  
  const pagosFiltrados = pagos.filter((pago) => {
    const texto = busqueda.toLowerCase();

    return (
      String(pago.id_pago).includes(texto) ||
      String(pago.id_factura).includes(texto) ||
      String(pago.metodo_pago).toLowerCase().includes(texto) ||
      String(pago.estado_pago).toLowerCase().includes(texto) ||
      String(pago.fecha_pago).slice(0, 10).includes(texto)
    );
  });

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>💳 Gestión de pagos</h2>
      <p>Administra los pagos de las facturas de Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>{pagoEditando ? 'Editar pago' : 'Registrar pago'}</h3>

        <div className="campos-grid">
          <label>
            Fecha de pago
            <input
              type="date"
              name="fecha_pago"
              value={formulario.fecha_pago}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Método de pago
            <select
              name="metodo_pago"
              value={formulario.metodo_pago}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona un método</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="PSE">PSE</option>
            </select>
          </label>

          <label>
            Estado del pago
            <select
              name="estado_pago"
              value={formulario.estado_pago}
              onChange={manejarCambio}
              required
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagado">Pagado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </label>

          <label>
            Valor del pago
            <input
              type="number"
              name="valor"
              min="0"
              step="0.01"
              value={formulario.valor}
              onChange={manejarCambio}
              required
            />
          </label>

          <label>
            Factura asociada
            <select
              name="id_factura"
              value={formulario.id_factura}
              onChange={manejarCambio}
              required
            >
              <option value="">Selecciona una factura</option>
              {facturas.map((factura) => (
                <option
                  key={factura.id_factura}
                  value={factura.id_factura}
                >
                  Factura #{factura.id_factura} — $
                  {Number(factura.total).toLocaleString('es-CO')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando
              ? 'Guardando...'
              : pagoEditando
                ? 'Actualizar pago'
                : 'Registrar pago'}
          </button>

          {pagoEditando && (
            <button type="button" onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Pagos registrados ({pagos.length})</h3>

        <input
          type="search"
          placeholder="Buscar por código, factura, método o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {pagosFiltrados.length === 0 ? (
          <p>No se encontraron pagos.</p>
        ) : (
          pagosFiltrados.map((pago) => (
            <article className="usuario-tarjeta" key={pago.id_pago}>
              <div>
                <strong>Pago #{pago.id_pago}</strong>
                <p>Fecha: {String(pago.fecha_pago).slice(0, 10)}</p>
                <p>Método: {pago.metodo_pago}</p>
                <p>Estado: {pago.estado_pago}</p>
                <p>
                  Valor: $
                  {Number(pago.valor).toLocaleString('es-CO')}
                </p>
                <p>Factura: #{pago.id_factura}</p>
              </div>

              <div className="acciones-usuario">
                <button
                  type="button"
                  onClick={() => prepararEdicion(pago)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarPago(pago.id_pago)}
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

export default GestionPagos;
