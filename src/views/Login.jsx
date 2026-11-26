import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, reiniciarError } from '../redux/usuarioSlice'
import './Auth.css'
import Etiqueta from '../components/comunes/Etiqueta'
import Mensaje from '../components/comunes/Mensaje'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { sesion, guardando: cargando, error } = useSelector((state) => state.usuario)

  const [formData, setFormData] = useState({ username: '', password: '' })

  useEffect(() => {
    dispatch(reiniciarError())
  }, [dispatch])

  // Cuando el backend confirma el login, se va a la página que se quería ver o al inicio de su rol
  useEffect(() => {
    if (sesion) {
      navigate(location.state?.desde ?? (sesion.rol === 'COMPRADOR' ? '/' : '/panel'), { replace: true })
    }
  }, [sesion, location.state, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(formData))
  }

  return (
    <div className="contenedor pagina auth">
      <section className="tarjeta auth-formulario">
        <Etiqueta>Pasajeros</Etiqueta>
        <h1>¡Hola de nuevo! Ingresá a tu cuenta</h1>
        <p className="texto-suave">Gestioná tus pasajes, tu carrito y tus próximos viajes.</p>

        {location.state?.sesionVencida && !error && (
          <Mensaje>Tu sesión venció. Iniciá sesión de nuevo para seguir.</Mensaje>
        )}
        {error && <Mensaje>{error}</Mensaje>}

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
