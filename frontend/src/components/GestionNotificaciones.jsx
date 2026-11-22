
import { useEffect, useState } from 'react';

const API = 'https://huellitas-vet-production.up.railway.app/api/notificaciones';

function GestionNotificaciones({ onVolver }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function consultar() {
      try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
          throw new Error('No fue posible consultar las notificaciones.');
        }

        const datos = await respuesta.json();

        if (!cancelado) {
          setNotificaciones(datos);
        }
      } catch (error) {
        if (!cancelado) {
          setMensaje(error.message);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    consultar();

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="panel">
      <h2>🔔 Gestión de notificaciones</h2>
      <p>Consulta las notificaciones de Huellitas Vet.</p>

      {cargando && <p>Cargando notificaciones...</p>}

      {mensaje && <p role="alert">{mensaje}</p>}

      {!cargando && !mensaje && (
        <>
          <h3>Notificaciones registradas ({notificaciones.length})</h3>

          {notificaciones.length === 0 ? (
            <p>No hay notificaciones registradas.</p>
          ) : (
            notificaciones.map((notificacion) => (
              <article
                className="usuario-tarjeta"
                key={notificacion.id_notificaciones}
              >
                <p><strong>Código:</strong> {notificacion.id_notificaciones}</p>
                <p><strong>Mensaje:</strong> {notificacion.mensaje}</p>
                <p><strong>Fecha de envío:</strong> {notificacion.fecha_envio}</p>
                <p><strong>Estado:</strong> {notificacion.estado}</p>
                <p><strong>Usuario:</strong> {notificacion.id_usuario}</p>
              </article>
            ))
          )}
        </>
      )}

      <button type="button" onClick={onVolver}>
        Volver al inicio
      </button>
    </section>
  );
}

export default GestionNotificaciones;
