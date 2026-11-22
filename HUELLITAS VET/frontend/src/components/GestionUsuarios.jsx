
import { useEffect, useState } from 'react';

const API_URL = `http://${window.location.hostname}:3000/api/usuarios`;

const formularioInicial = {
  nombre: '',
  apellido: '',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  contraseña: '',
  rol: 'cliente',
};

function GestionUsuarios({ onVolver }) {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarUsuarios() {
    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error('No fue posible consultar los usuarios.');
      }

      const datos = await respuesta.json();
      setUsuarios(datos);
    } catch (error) {
      setMensaje(error.message);
    }
  }

  useEffect(() => {
  let cancelado = false;

  fetch(API_URL)
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error('No fue posible consultar los usuarios.');
      }

      return respuesta.json();
    })
    .then((datos) => {
      if (!cancelado) {
        setUsuarios(datos);
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

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function prepararEdicion(usuario) {
    setUsuarioEditando(usuario.id_usuario);

    setFormulario({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      documento: usuario.documento || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo || '',
      direccion: usuario.direccion || '',
      contraseña: '',
      rol: usuario.rol || 'cliente',
    });

    setMensaje('Editando usuario #' + usuario.id_usuario);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setUsuarioEditando(null);
    setFormulario(formularioInicial);
    setMensaje('');
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setCargando(true);
    setMensaje('');

    try {
      const editando = usuarioEditando !== null;

      if (!editando && !formulario.contraseña) {
        throw new Error('La contraseña es obligatoria.');
      }

      const respuesta = await fetch(
        editando ? `${API_URL}/${usuarioEditando}` : API_URL,
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formulario),
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No fue posible guardar el usuario.');
      }

      setMensaje(resultado.mensaje || 'Usuario guardado correctamente.');
      setFormulario(formularioInicial);
      setUsuarioEditando(null);

      await cargarUsuarios();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarUsuario(id) {
    const confirmar = window.confirm(
      '¿Estás seguro de que deseas eliminar este usuario?'
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.mensaje || 'No fue posible eliminar el usuario.');
      }

      setMensaje(resultado.mensaje);
      await cargarUsuarios();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.toLowerCase();

    return (
      `${usuario.nombre} ${usuario.apellido}`.toLowerCase().includes(texto) ||
      String(usuario.documento).toLowerCase().includes(texto) ||
      String(usuario.correo).toLowerCase().includes(texto)
    );
  });

  return (
    <section className="formulario-panel gestion-usuarios">
      <h2>Gestión de usuarios</h2>
      <p>Administra los usuarios registrados en Huellitas Vet.</p>

      <form onSubmit={manejarEnvio}>
        <h3>{usuarioEditando ? 'Editar usuario' : 'Registrar usuario'}</h3>

        <div className="campos-grid">
          <label>
            Nombre
            <input name="nombre" value={formulario.nombre}
              onChange={manejarCambio} required />
          </label>

          <label>
            Apellido
            <input name="apellido" value={formulario.apellido}
              onChange={manejarCambio} required />
          </label>

          <label>
            Documento
            <input name="documento" value={formulario.documento}
              onChange={manejarCambio} required />
          </label>

          <label>
            Teléfono
            <input name="telefono" value={formulario.telefono}
              onChange={manejarCambio} required />
          </label>

          <label>
            Correo electrónico
            <input name="correo" type="email" value={formulario.correo}
              onChange={manejarCambio} required />
          </label>

          <label>
            Dirección
            <input name="direccion" value={formulario.direccion}
              onChange={manejarCambio} required />
          </label>

          <label>
            Contraseña {usuarioEditando ? '(opcional)' : ''}
            <input
              name="contraseña"
              type="password"
              value={formulario.contraseña}
              onChange={manejarCambio}
              required={!usuarioEditando}
              minLength={8}
              placeholder={usuarioEditando ? 'Dejar vacía para conservarla' : 'Mínimo 8 caracteres'}
            />
          </label>

          <label>
            Rol
            <select name="rol" value={formulario.rol}
              onChange={manejarCambio} required>
              <option value="cliente">Cliente</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>
        </div>

        <div className="acciones-formulario">
          <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : usuarioEditando ? 'Actualizar usuario' : 'Registrar usuario'}
          </button>

          {usuarioEditando && (
            <button type="button" className="boton-secundario"
              onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {mensaje && <p className="mensaje" role="status">{mensaje}</p>}

      <div className="lista-usuarios">
        <h3>Usuarios registrados ({usuarios.length})</h3>

        <input
          type="search"
          placeholder="Buscar por nombre, documento o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {usuariosFiltrados.length === 0 ? (
          <p>No se encontraron usuarios.</p>
        ) : (
          usuariosFiltrados.map((usuario) => (
            <article className="usuario-tarjeta" key={usuario.id_usuario}>
              <div>
                <strong>{usuario.nombre} {usuario.apellido}</strong>
                <p>Documento: {usuario.documento}</p>
                <p>Teléfono: {usuario.telefono}</p>
                <p>Correo: {usuario.correo}</p>
                <p>Dirección: {usuario.direccion}</p>
                <p>Rol: {usuario.rol}</p>
              </div>

              <div className="acciones-usuario">
                <button type="button" onClick={() => prepararEdicion(usuario)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarUsuario(usuario.id_usuario)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <button type="button" className="boton-secundario"
        onClick={onVolver}>
        Volver al inicio
      </button>
    </section>
  );
}

export default GestionUsuarios;
