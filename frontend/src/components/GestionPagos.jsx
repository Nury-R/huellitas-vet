
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api';

const formularioInicial = {
  fecha_pago: '',
  metodo_pago: '',
  estado_pago: 'Pagado',
  tipo_pago: 'Completo',
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

  // FACTURA SELECCIONADA
  const facturaSeleccionada = facturas.find(
    (factura) =>
      String(factura.id_factura) === String(formulario.id_factura)
  );

  const totalFactura = Number(facturaSeleccionada?.total || 0);

  // PAGOS ANTERIORES DE LA FACTURA
  const totalAbonado = pagos
    .filter(
      (pago) =>
        String(pago.id_factura) === String(formulario.id_factura) &&
        pago.estado_pago === 'Pagado' &&
        Number(pago.id_pago) !== Number(pagoEditando)
    )
    .reduce(
      (suma, pago) => suma + Number(pago.valor || 0),
      0
    );

  const saldoPendiente = Math.max(
    0,
    totalFactura - totalAbonado
  );

  const valorIngresado = Number(formulario.valor || 0);

  const nuevoSaldo = Math.max(
    0,
    saldoPendiente - valorIngresado
  );

  // CONSULTAR PAGOS
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

  // CARGAR PAGOS Y FACTURAS
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
        if (!cancelado) {
          setMensaje(error.message);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // MANEJAR CAMBIOS DEL FORMULARIO
  function manejarCambio(e) {
    const { name, value } = e.target;

    if (name === 'tipo_pago') {
      setFormulario((anterior) => ({
        ...anterior,
        tipo_pago: value,
        valor:
          value === 'Completo'
            ? String(saldoPendiente)
            : '',
        estado_pago: 'Pagado',
      }));

      return;
    }

    if (name === 'id_factura') {
      const factura = facturas.find(
        (f) => String(f.id_factura) === String(value)
      );

      const abonado = pagos
        .filter(
          (p) =>
            String(p.id_factura) === String(value) &&
            p.estado_pago === 'Pagado' &&
            Number(p.id_pago) !== Number(pagoEditando)
        )
        .reduce(
          (suma, p) => suma + Number(p.valor || 0),
          0
        );

      const saldo = Math.max(
        0,
        Number(factura?.total || 0) - abonado
      );

      setFormulario((anterior) => ({
        ...anterior,
        id_factura: value,
        valor:
          anterior.tipo_pago === 'Completo'
            ? String(saldo)
            : '',
        estado_pago: 'Pagado',
      }));

      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // PREPARAR EDICIÓN
  function prepararEdicion(pago) {
    setPagoEditando(pago.id_pago);

    setFormulario({
      fecha_pago: String(pago.fecha_pago).slice(0, 10),
      metodo_pago: pago.metodo_pago,
      estado_pago: 'Pagado',
      tipo_pago: 'Abono',
      valor: pago.valor,
      id_factura: String(pago.id_factura),
    });

    setMensaje(`Editando pago #${pago.id_pago}`);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // CANCELAR EDICIÓN
  function cancelarEdicion() {
    setPagoEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  // REGISTRAR O ACTUALIZAR PAGO
  async function manejarEnvio(e) {
    e.preventDefault();

    setCargando(true);
    setMensaje('');

    try {
      const monto = Number(formulario.valor);

      if (!formulario.id_factura) {
        throw new Error('Selecciona una factura.');
      }

      if (!Number.isFinite(monto) || monto <= 0) {
        throw new Error('Ingresa un valor de pago válido.');
      }

      if (monto > saldoPendiente) {
        throw new Error(
          `El valor supera el saldo pendiente de $${saldoPendiente.toLocaleString('es-CO')}.`
        );
      }

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
            fecha_pago: formulario.fecha_pago,
            metodo_pago: formulario.metodo_pago,
            estado_pago: 'Pagado',
            tipo_pago: formulario.tipo_pago,
            valor: monto,
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
          (editando
            ? 'Pago actualizado correctamente.'
            : 'Pago registrado correctamente.')
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

  // ELIMINAR PAGO
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

  // FILTRAR PAGOS
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

  // INTERFAZ
  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>💳 Gestión de pagos</h2>

      <p>
        Administra los pagos de las facturas de Huellitas Vet.
      </p>

      <form onSubmit={manejarEnvio}>
        <h3>
          {pagoEditando ? 'Editar pago' : 'Registrar pago'}
        </h3>

        <div className="campos-grid">

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
            Tipo de pago
            <select
              name="tipo_pago"
              value={formulario.tipo_pago}
              onChange={manejarCambio}
              required
            >
              <option value="Completo">Pago completo</option>
              <option value="Abono">Abono</option>
            </select>
          </label>

          {formulario.id_factura && (
            <div className="resumen-pago">
              <h4>Resumen de la factura</h4>

              <p>
                Total de la factura: $
                {totalFactura.toLocaleString('es-CO')}
              </p>

              <p>
                Total abonado anteriormente: $
                {totalAbonado.toLocaleString('es-CO')}
              </p>

              <p>
                Saldo pendiente antes del pago: $
                {saldoPendiente.toLocaleString('es-CO')}
              </p>

              <p>
                Saldo pendiente después del pago: $
                {nuevoSaldo.toLocaleString('es-CO')}
              </p>
            </div>
          )}

          <label>
            {formulario.tipo_pago === 'Abono'
              ? 'Valor del abono'
              : 'Valor del pago'}

            <input
              type="number"
              name="valor"
              min="1"
              step="1"
              max={saldoPendiente}
              value={formulario.valor}
              onChange={manejarCambio}
              placeholder="Ingresa el valor"
              required
            />
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
            <button
              type="button"
              onClick={cancelarEdicion}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && (
        <p role="status">{mensaje}</p>
      )}

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
            <article
              className="usuario-tarjeta"
              key={pago.id_pago}
            >
              <div>
                <strong>Pago #{pago.id_pago}</strong>

                <p>
                  Fecha: {String(pago.fecha_pago).slice(0, 10)}
                </p>

                <p>Método: {pago.metodo_pago}</p>

                <p>Estado: {pago.estado_pago}</p>
                <p>Tipo de pago: {pago.tipo_pago}</p>

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
