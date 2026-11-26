import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Mensaje from '../comunes/Mensaje'
import { registrarAdministrador } from '../../redux/usuarioSlice'
import { REGLA_NOMBRE, REGLA_USUARIO } from '../../utils/validaciones'

const FORM_VACIO = { nombre: '', apellido: '', username: '', mail: '', password: '' }

// Alta de un administrador: el padre lo reinicia (key) cuando el backend confirma que se creó
function FormAdministrador() {
  const dispatch = useDispatch()
  const { guardando, error } = useSelector((state) => state.usuario)
  const [formData, setFormData] = useState(FORM_VACIO)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(
      registrarAdministrador({
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        username: formData.username.trim(),
        rol: 'ADMIN',
      }),
    )
  }

  return (
    <section className="tarjeta panel-formulario">
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
              {...REGLA_USUARIO}
              required
            />
            <small className="texto-suave">4 a 20 caracteres, empieza con letra, sin espacios ni tildes.</small>
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
  )
}

export default FormAdministrador
