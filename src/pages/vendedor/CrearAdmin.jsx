import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import './Panel.css'

const FORM_VACIO = { nombre: '', apellido: '', username: '', mail: '', password: '' }

// Solo para administradores. El registro publico no deja crear admins:
// un admin nuevo solo lo puede dar de alta otro admin con
// POST /api/auth/registro/administrador (el backend verifica el rol del token).
function CrearAdmin() {
  const [formData, setFormData] = useState(FORM_VACIO)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)
    try {
      // El backend fuerza rol ADMIN, pero el campo es obligatorio en el body
      const creado = await api('/api/auth/registro/administrador', {
        method: 'POST',
        body: { ...formData, rol: 'ADMIN' },
      })
      setExito(`Se creó el administrador "${creado.username}". Ya puede iniciar sesión.`)
      setFormData(FORM_VACIO)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="contenedor pagina">
      <Link to="/panel" className="panel-volver">
        ← Volver al panel
      </Link>

      <section className="tarjeta panel-formulario">
        <span className="etiqueta">Solo administradores</span>
        <h1 className="panel-formulario-titulo">Crear administrador</h1>
        <p className="texto-suave">
          Un administrador puede ver y modificar los vuelos de todos los vendedores, y crear otros administradores.
        </p>

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {exito && <div className="mensaje mensaje-exito">{exito}</div>}

        <form onSubmit={handleSubmit}>
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
              <input id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="campo">
              <label htmlFor="mail">Correo electrónico</label>
              <input id="mail" name="mail" type="email" value={formData.mail} onChange={handleChange} required />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña inicial</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <button className="boton boton-primario" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear administrador'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default CrearAdmin
