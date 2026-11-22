import { useState } from 'react';
import GestionUsuarios from './components/GestionUsuarios.jsx';
import ConsultarMascotas from './components/ConsultarMascotas.jsx';
import GestionCitas from './components/GestionCitas.jsx';
import ConsultarCitas from './components/ConsultarCitas.jsx';
import Login from './components/Login.jsx';
import GestionMascotas from './components/GestionMascotas.jsx';
import GestionServicios from './components/GestionServicios.jsx';
import GestionFacturas from './components/GestionFacturas.jsx';
import GestionPagos from './components/GestionPagos.jsx';
import GestionNotificaciones from './components/GestionNotificaciones.jsx';
import './App.css';

function App() {
  const [modulo, setModulo] = useState('Inicio');
  const [autenticado, setAutenticado] = useState(false);
     
const botones = [
  { nombre: 'Usuarios', texto: 'Registrar usuario', icono: '👥' },
  { nombre: 'Mascotas', texto: 'Registrar mascota', icono: '🐾' },
  { nombre: 'Consultar mascotas', texto: 'Consultar mascotas', icono: '🐶' },
  { nombre: 'Citas', texto: 'Solicitar cita', icono: '📅' },
  { nombre: 'Consultar citas', texto: 'Consultar citas', icono: '🗓️' },
  { nombre: 'Facturación y pagos', texto: 'Facturación y pagos', icono: '🧾' },
  { nombre: 'Servicios', texto: 'Servicios veterinarios', icono: '🩺' },
  { nombre: 'Notificaciones', texto: 'Notificaciones', icono: '🔔' },
];
if (!autenticado) {
  return <Login onLogin={() => setAutenticado(true)} />;
}

  return (
    <div className="app">
      <header className="encabezado">
        <img
          src="/logo-huellitas.png"
          alt="Logo Huellitas Vet"
          className="logo-huellitas"
        />
        <div>
          <h1>Huellitas Vet</h1>
          <p>Clínica veterinaria</p>
        </div>
      </header>

      <main className="contenido">
  
{modulo === 'Usuarios' ? (
  <GestionUsuarios onVolver={() => setModulo('Inicio')} />
) : modulo === 'Mascotas' ? (
  <GestionMascotas onVolver={() => setModulo('Inicio')} />
) : modulo === 'Consultar mascotas' ? (
  <ConsultarMascotas onVolver={() => setModulo('Inicio')} />
) : modulo === 'Citas' ? (
  <GestionCitas onVolver={() => setModulo('Inicio')} />
  ) : modulo === 'Consultar citas' ? (
  <ConsultarCitas onVolver={() => setModulo('Inicio')} />
  ) : modulo === 'Servicios' ? (
  <GestionServicios onVolver={() => setModulo('Inicio')} />
  ) : modulo === 'Notificaciones' ? (
  <GestionNotificaciones onVolver={() => setModulo('Inicio')} />
) : modulo === 'Facturación y pagos' ? (
  <>
    <GestionFacturas onVolver={() => setModulo('Inicio')} />
    <GestionPagos onVolver={() => setModulo('Inicio')} />
  </>
) : modulo === 'Inicio' ? (

  <>
    <section className="bienvenida">
      <h2>¡Bienvenido a Huellitas Vet!</h2>
      <p>Cuidamos la salud y el bienestar de tus mascotas.</p>
    </section>

    <section className="modulos">
      {botones.map((boton, indice) => (
        <button
          key={boton.nombre}
          className={`tarjeta-modulo color-${indice + 1}`}
          onClick={() => setModulo(boton.nombre)}
        >
          <span className="icono-modulo" aria-hidden="true">
            {boton.icono}
          </span>
          <span>{boton.texto}</span>
        </button>
      ))}
    </section>
  </>
) : (
  <section className="panel">
    <h2>{modulo}</h2>
    <p>Este módulo se integrará con el sistema Huellitas Vet.</p>
    <button onClick={() => setModulo('Inicio')}>
      Volver al inicio
    </button>
  </section>
)}

      </main>

      <nav className="barra-inferior" aria-label="Navegación principal">
        <button
          className={modulo === 'Inicio' ? 'nav-activo' : ''}
          onClick={() => setModulo('Inicio')}
        >
          <span aria-hidden="true">⌂</span>
          Inicio
        </button>

        <button
          className={modulo === 'Mascotas' ? 'nav-activo' : ''}
          onClick={() => setModulo('Mascotas')}
        >
          <span aria-hidden="true">🐾</span>
          Mascotas
        </button>

        <button
          className={modulo === 'Citas' ? 'nav-activo' : ''}
          onClick={() => setModulo('Citas')}
        >
          <span aria-hidden="true">▦</span>
          Citas
        </button>

        <button
          className={modulo === 'Usuarios' ? 'nav-activo' : ''}
          onClick={() => setModulo('Usuarios')}
        >
          <span aria-hidden="true">♙</span>
          Perfil
        </button>
      </nav>
    </div>
  );
}

export default App;
