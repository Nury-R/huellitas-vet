
import { useEffect, useState } from 'react';

function ConsultarMascotas({ onVolver }) {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const consultar = async () => {
      try {
        const respuesta = await fetch(
          'http://localhost:3000/api/mascotas'
        );

        if (!respuesta.ok) {
          throw new Error('No fue posible consultar las mascotas.');
        }

        const datos = await respuesta.json();
        setMascotas(datos);
      } catch (err) {
        console.error(err);
        setError(
          'No se pudo conectar con el servidor. Verifica que esté activo.'
        );
      } finally {
        setCargando(false);
      }
    };

    consultar();
  }, []);

  return (
    <section className="panel">
      <h2>🐾 Mascotas registradas</h2>

      {cargando && <p>Consultando mascotas...</p>}
      {error && <p role="alert">{error}</p>}

      {!cargando && !error && mascotas.length === 0 && (
        <p>No hay mascotas registradas.</p>
      )}

      {mascotas.map((mascota) => (
        <article
          key={mascota.id_mascota}
          className="tarjeta-mascota"
        >
          <h3>{mascota.nombre}</h3>
          <p><strong>Código:</strong> {mascota.id_mascota}</p>
          <p><strong>Especie:</strong> {mascota.especie}</p>
          <p><strong>Raza:</strong> {mascota.raza}</p>
          <p><strong>Sexo:</strong> {mascota.sexo}</p>
          <p><strong>Peso:</strong> {mascota.peso} kg</p>
          <p>
            <strong>Propietario:</strong> {mascota.id_usuario}
          </p>
        </article>
      ))}

      <button onClick={onVolver}>Volver al inicio</button>
    </section>
  );
}

export default ConsultarMascotas;
