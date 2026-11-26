import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CampoFecha from '../CampoFecha'
import Mensaje from '../comunes/Mensaje'
import { editarPerfil } from '../../redux/usuarioSlice'
import { hoy } from '../../utils/formato'
import { REGLA_NOMBRE } from '../../utils/validaciones'

// Datos personales del usuario: el formulario parte de lo que hay en el store y guarda por su cuenta
function FormPerfil({ perfil }) {
  const dispatch = useDispatch()
  const { guardando, error } = useSelector((state) => state.usuario)

  const [formData, setFormData] = useState({
    nombre: perfil.nombre ?? '',
    apellido: perfil.apellido ?? '',
    dni: perfil.dni ?? '',
    fechaNacimiento: perfil.fechaNacimiento ?? '',
    telefono: perfil.telefono ?? '',
  })

  const faltanDatos = perfil.rol === 'COMPRADOR' && (!perfil.dni || !perfil.fechaNacimiento)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(
      editarPerfil({
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        fechaNacimiento: formData.fechaNacimiento || null,
      }),
    )
  }

  return (
    <section className="tarjeta">
      <h2 className="perfil-subtitulo">Datos personales</h2>
      <p className="texto-suave perfil-aclaracion">
        {perfil.rol === 'COMPRADOR'
          ? 'Son los datos del pasajero titular. Completalos antes de volar.'
          : 'Tus datos de contacto.'}
      </p>

      {faltanDatos && (
        <Mensaje tipo={null} className="perfil-aviso">
          Te falta completar tu DNI y fecha de nacimiento.
        </Mensaje>
      )}
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
            <label htmlFor="dni">DNI</label>
            <input
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d{7,9}"
              title="De 7 a 9 números, sin puntos"
              placeholder="Sin puntos"
            />
          </div>
          <div className="campo">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <CampoFecha
              id="fechaNacimiento"
              max={hoy()}
              value={formData.fechaNacimiento}
              onChange={(valor) => {
                setFormData({ ...formData, fechaNacimiento: valor })
              }}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="11 2233 4455"
          />
        </div>

        <button className="boton boton-primario" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  )
}

export default FormPerfil
