import { useEffect, useState } from 'react'
import { api } from '../api/api'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { fechaLarga } from '../utils/formato'
import './Perfil.css'

const NOMBRES_DE_ROL = {
  COMPRADOR: 'Comprador',
  VENDEDOR: 'Vendedor',
  ADMIN: 'Administrador',
}

// GET /api/auth/me trae los datos; PUT /api/auth/me guarda los datos de pasajero.
// Username, mail y rol no se pueden cambiar (el backend no lo permite).
function Perfil() {
  const [usuario, setUsuario] = useState(null)
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Pasa los datos del backend al formulario (los null se muestran como vacios)
  const cargarFormulario = (datos) => {
    setUsuario(datos)
    setFormData({
      nombre: datos.nombre ?? '',
      apellido: datos.apellido ?? '',
      dni: datos.dni ?? '',
      fechaNacimiento: datos.fechaNacimiento ?? '',
      telefono: datos.telefono ?? '',
    })
  }

  useEffect(() => {
    api('/api/auth/me')
      .then(cargarFormulario)
      .catch((err) => setError(err.message))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setExito('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)
    try {
      const actualizado = await api('/api/auth/me', {
        method: 'PUT',
        body: {
          ...formData,
          // El backend espera null (no "") si no hay fecha
          fechaNacimiento: formData.fechaNacimiento || null,
        },
      })
      cargarFormulario(actualizado)
      setExito('Tus datos se guardaron correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (!usuario) {
    return (
      <div className="contenedor pagina">
        {error ? <div className="mensaje mensaje-error">{error}</div> : <p className="texto-suave">Cargando perfil…</p>}
      </div>
    )
  }

  const faltanDatos = usuario.rol === 'COMPRADOR' && (!usuario.dni || !usuario.fechaNacimiento)

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" subtitulo="Tus datos de cuenta y del pasajero titular." />

      <div className="contenedor sobre-encabezado perfil">
        <div className="perfil-layout">
          <aside className="tarjeta perfil-cuenta">
            <span className="perfil-avatar" aria-hidden="true">
              {usuario.nombre?.[0] ?? usuario.username[0]}
            </span>
            <h2>
              {usuario.nombre} {usuario.apellido}
            </h2>
            <span className="etiqueta">{NOMBRES_DE_ROL[usuario.rol]}</span>

            <dl>
              <dt>Usuario</dt>
              <dd>{usuario.username}</dd>
              <dt>Correo electrónico</dt>
              <dd>{usuario.mail}</dd>
              <dt>Miembro desde</dt>
              <dd>{fechaLarga(usuario.fechaRegistro)}</dd>
            </dl>
          </aside>

          <section className="tarjeta">
            <h2 className="perfil-subtitulo">Datos personales</h2>
            <p className="texto-suave perfil-aclaracion">
              {usuario.rol === 'COMPRADOR'
                ? 'Son los datos del pasajero titular. Completalos antes de volar.'
                : 'Tus datos de contacto como vendedor.'}
            </p>

            {faltanDatos && (
              <div className="mensaje perfil-aviso">Te falta completar tu DNI y fecha de nacimiento.</div>
            )}
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
                  <input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
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
        </div>
      </div>
    </>
  )
}

export default Perfil
