import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { useAvisos } from '../context/AvisosContext'
import EncabezadoPagina from '../components/EncabezadoPagina'
import { fechaLarga, hoy, millas } from '../utils/formato'
import CampoFecha from '../components/CampoFecha'
import { REGLA_NOMBRE } from '../utils/validaciones'
import './Perfil.css'
import Cargando from '../components/comunes/Cargando'
import Etiqueta from '../components/comunes/Etiqueta'
import Mensaje from '../components/comunes/Mensaje'

const NOMBRES_DE_ROL = {
  COMPRADOR: 'Comprador',
  ADMIN: 'Administrador',
}

function Perfil() {
  const { setPerfil } = useAuth()
  const [usuario, setUsuario] = useState(null)
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState('')
  const { avisar } = useAvisos()
  const [guardando, setGuardando] = useState(false)

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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)

    const datosAEnviar = {
      ...formData,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      fechaNacimiento: formData.fechaNacimiento || null,
    }

    api('/api/auth/me', { method: 'PUT', body: datosAEnviar })
      .then((actualizado) => {
        cargarFormulario(actualizado)
        setPerfil(actualizado)
        avisar('Tus datos se guardaron correctamente.')
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(false))
  }

  if (!usuario) {
    return (
      <div className="contenedor pagina">
        {error ? <Mensaje>{error}</Mensaje> : <Cargando texto="Cargando perfil…" />}
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
            <Etiqueta>{NOMBRES_DE_ROL[usuario.rol]}</Etiqueta>

            <dl>
              <dt>Usuario</dt>
              <dd>{usuario.username}</dd>
              <dt>Correo electrónico</dt>
              <dd>{usuario.mail}</dd>
              <dt>Miembro desde</dt>
              <dd>{fechaLarga(usuario.fechaRegistro)}</dd>
              {usuario.rol === 'COMPRADOR' && (
                <>
                  <dt>Millas</dt>
                  <dd className="perfil-millas">✈ {millas(usuario.millas)}</dd>
                </>
              )}
            </dl>
          </aside>

          <section className="tarjeta">
            <h2 className="perfil-subtitulo">Datos personales</h2>
            <p className="texto-suave perfil-aclaracion">
              {usuario.rol === 'COMPRADOR'
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
        </div>
      </div>
    </>
  )
}

export default Perfil
