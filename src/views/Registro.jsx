import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login, registrarUsuario, reiniciarError, reiniciarRegistrado } from '../redux/usuarioSlice'
import { REGLA_NOMBRE, REGLA_USUARIO } from '../utils/validaciones'
import './Auth.css'
import Etiqueta from '../components/comunes/Etiqueta'
import Mensaje from '../components/comunes/Mensaje'

const FORM_VACIO = {
  nombre: '',
  apellido: '',
  username: '',
  mail: '',
  password: '',
  confirmarPassword: '',
}

function Registro() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { registrado, sesion, guardando: cargando, error: errorDelBackend } = useSelector((state) => state.usuario)

  const [formData, setFormData] = useState(FORM_VACIO)
  // Avisos del formulario (contraseñas distintas): lo que responde el backend sale de `errorDelBackend`
  const [problema, setProblema] = useState('')
  const error = problema || errorDelBackend

  useEffect(() => {
    dispatch(reiniciarError())
  }, [dispatch])

  // Cuando el backend confirma el registro, se inicia sesión con los mismos datos
  useEffect(() => {
    if (registrado) {
      dispatch(reiniciarRegistrado())
      dispatch(login({ username: formData.username.trim(), password: formData.password }))
    }
  }, [registrado, formData, dispatch])

  // Cuando el backend confirma el login, se va al inicio
  useEffect(() => {
    if (sesion) {
      navigate('/', { replace: true })
    }
  }, [sesion, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmarPassword) {
      setProblema('Las contraseñas no coinciden')
      return
    }

    setProblema('')
    dispatch(
      registrarUsuario({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        username: formData.username.trim(),
        mail: formData.mail,
        password: formData.password,
      }),
    )
  }

  return (
    <div className="contenedor pagina auth">
      <section className="tarjeta auth-formulario">
        <Etiqueta>Crear cuenta</Etiqueta>
        <h1>Sumate a BCA Airlines</h1>
        <p className="texto-suave">
          Después podés completar tu DNI y datos de pasajero desde tu perfil.
        </p>

        {error && <Mensaje>{error}</Mensaje>}

        <form onSubmit={handleSubmit}>
          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} {...REGLA_NOMBRE} required />
            </div>
            <div className="campo">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                {...REGLA_NOMBRE}
                required
              />
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
                {...REGLA_USUARIO}
                required
              />
              <small className="texto-suave">4 a 20 caracteres, empieza con letra, sin espacios ni tildes.</small>
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
        <span className="auth-panel-etiqueta">Beneficios de tu cuenta</span>
        <h2>Tu próximo viaje empieza acá</h2>
        <ul>
          <li>Comprá pasajes de ida y vuelta a Argentina, América y Europa</li>
          <li>Elegí tu clase: Económica, Ejecutiva o Primera</li>
          <li>Tu carrito y tus compras quedan guardados en tu cuenta</li>
          <li>Cancelá una compra desde tu cuenta si cambian tus planes</li>
        </ul>
      </aside>
    </div>
  )
}

export default Registro
