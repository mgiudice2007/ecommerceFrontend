import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Un solo handler para todos los inputs: usa el atributo name de cada uno
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const usuario = await login(formData.username, formData.password)

      // Si venia de una pagina protegida vuelve ahi; si no, segun su rol
      const destino =
        location.state?.desde ?? (usuario.rol === 'COMPRADOR' ? '/vuelos' : '/panel')
      navigate(destino, { replace: true })
    } catch (err) {
      // Si la clave esta mal el backend responde "Usuario o contraseña incorrectos"
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor pagina auth">
      <section className="tarjeta auth-formulario">
        <span className="etiqueta">Pasajeros y vendedores</span>
        <h1>¡Hola de nuevo! Ingresá a tu cuenta</h1>
        <p className="texto-suave">Gestioná tus pasajes o los vuelos que publicás.</p>

        {error && <div className="mensaje mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tu nombre de usuario"
              autoComplete="username"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="boton boton-primario boton-ancho" disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Iniciar sesión →'}
          </button>
        </form>

        <p className="auth-pie">
          ¿No tenés cuenta todavía? <Link to="/registro">Registrate gratis</Link>
        </p>
      </section>

      <aside className="auth-panel">
        <span className="auth-panel-etiqueta">BCA Airlines</span>
        <h2>Volá alto por toda la Argentina y el mundo</h2>
        <p>Buscá vuelos por origen y destino, elegí tu clase y comprá en pocos pasos.</p>
        <ul>
          <li>Precios finales con los descuentos vigentes ya aplicados</li>
          <li>Tu carrito queda guardado en tu cuenta</li>
          <li>Podés cancelar una compra y se liberan los asientos</li>
        </ul>
      </aside>
    </div>
  )
}

export default Login
