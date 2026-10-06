import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const ROLES = [
  { valor: 'COMPRADOR', titulo: 'Quiero comprar pasajes', detalle: 'Buscá vuelos y comprá con tu carrito' },
  { valor: 'VENDEDOR', titulo: 'Quiero vender vuelos', detalle: 'Publicá vuelos, asientos y promociones' },
]

const FORM_VACIO = {
  nombre: '',
  apellido: '',
  username: '',
  mail: '',
  password: '',
  confirmarPassword: '',
  rol: 'COMPRADOR',
}

function Registro() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(FORM_VACIO)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    try {
      // confirmarPassword es solo del formulario: al backend se manda el resto
      const datos = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        username: formData.username,
        mail: formData.mail,
        password: formData.password,
        rol: formData.rol,
      }
      await api('/api/auth/registro', { method: 'POST', body: datos })

      // Despues de registrarse lo dejamos logueado directamente
      const usuario = await login(datos.username, datos.password)
      navigate(usuario.rol === 'COMPRADOR' ? '/vuelos' : '/panel', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenedor pagina auth">
      <section className="tarjeta auth-formulario">
        <span className="etiqueta">Crear cuenta</span>
        <h1>Sumate a BCA Airlines</h1>
        <p className="texto-suave">
          Después podés completar tu DNI y datos de pasajero desde tu perfil.
        </p>

        {error && <div className="mensaje mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <fieldset className="auth-roles">
            <legend>¿Qué querés hacer?</legend>
            {ROLES.map((rol) => (
              <label
                key={rol.valor}
                className={`auth-rol ${formData.rol === rol.valor ? 'seleccionado' : ''}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={rol.valor}
                  checked={formData.rol === rol.valor}
                  onChange={handleChange}
                />
                <strong>{rol.titulo}</strong>
                <small>{rol.detalle}</small>
              </label>
            ))}
          </fieldset>

          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className="campo">
              <label htmlFor="apellido">Apellido</label>
              <input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>
          </div>

          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="mail">Correo electrónico</label>
              <input
                id="mail"
                name="mail"
                type="email"
                value={formData.mail}
                onChange={handleChange}
                placeholder="nombre@correo.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="confirmarPassword">Confirmar contraseña</label>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                value={formData.confirmarPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button className="boton boton-primario boton-ancho" disabled={cargando}>
            {cargando ? 'Creando cuenta…' : 'Crear mi cuenta gratis →'}
          </button>
        </form>

        <p className="auth-pie">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>

      <aside className="auth-panel">
        <span className="auth-panel-etiqueta">Una cuenta, dos formas de usarla</span>
        <h2>Comprá pasajes o publicá tus propios vuelos</h2>
        <p>
          <strong>Pasajeros:</strong> buscan vuelos, eligen la clase (Económica, Ejecutiva o Primera) y
          compran desde su carrito.
        </p>
        <p>
          <strong>Vendedores:</strong> publican vuelos, cargan los asientos de cada clase, suben fotos y
          crean promociones con descuento.
        </p>
      </aside>
    </div>
  )
}

export default Registro
