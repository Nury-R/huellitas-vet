import { useState } from 'react';

function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarIngreso = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!correo.trim() || !contrasena) {
      setMensaje('Por favor, ingrese correo y contraseña.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        'https://huellitas-vet-production.up.railway.app/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo: correo.trim(),
            contraseña: contrasena,
          }),
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje('Ingreso exitoso.');
        onLogin();
      } else {
        setMensaje(datos.mensaje || 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setMensaje('No fue posible conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-contenedor">
      <form className="login-formulario" onSubmit={manejarIngreso}>
        <img
          src="/logo-huellitas.png"
          alt="Logo Huellitas Vet"
          className="login-logo"
        />

        <h1>Huellitas Vet</h1>
        <h2>Iniciar sesión</h2>
        <p>Bienvenido a nuestra clínica veterinaria</p>

        <label htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          type="email"
          placeholder="Ingrese su correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          placeholder="Ingrese su contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        {mensaje && <p role="alert">{mensaje}</p>}
      </form>
    </div>
  );
}

export default Login;