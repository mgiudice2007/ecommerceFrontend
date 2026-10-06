import { useCallback, useEffect, useRef, useState } from 'react'
import { api, urlFoto } from '../../api/api'

const MAXIMO_FOTOS = 5 // el backend no deja subir mas de 5 por vuelo
const MAXIMO_MB = 5

// Pestaña "Fotos": subir (multipart/form-data) y borrar fotos del vuelo.
function TabFotos({ vuelo, onCambio }) {
  const [fotos, setFotos] = useState([])
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const inputArchivo = useRef(null) // para poder vaciar el <input type="file"> despues de subir

  const cargar = useCallback(() => {
    api(`/api/fotos?vueloId=${vuelo.id}`)
      .then(setFotos)
      .catch((err) => setError(err.message))
  }, [vuelo.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  const elegirArchivo = (e) => {
    const elegido = e.target.files[0] ?? null
    setError('')
    setExito('')
    if (elegido && elegido.size > MAXIMO_MB * 1024 * 1024) {
      setError(`La foto pesa más de ${MAXIMO_MB} MB`)
      setArchivo(null)
      return
    }
    setArchivo(elegido)
  }

  const subir = async (e) => {
    e.preventDefault()
    if (!archivo) return

    // Igual que en la clase de subida de imagenes: los datos van en un FormData.
    // El campo del archivo se tiene que llamar "file", como espera el backend.
    const formData = new FormData()
    formData.append('vueloId', vuelo.id)
    formData.append('file', archivo)

    setSubiendo(true)
    setError('')
    setExito('')
    try {
      await api('/api/fotos', { method: 'POST', body: formData })
      setExito('Foto subida.')
      setArchivo(null)
      inputArchivo.current.value = ''
      cargar()
      onCambio()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  const eliminar = async (foto) => {
    if (!window.confirm('¿Eliminar esta foto?')) return
    setError('')
    setExito('')
    try {
      const respuesta = await api(`/api/fotos/${foto.id}`, { method: 'DELETE' })
      setExito(respuesta.mensaje) // "Foto eliminada correctamente"
      cargar()
      onCambio()
    } catch (err) {
      setError(err.message)
    }
  }

  const lleno = fotos.length >= MAXIMO_FOTOS

  return (
    <div className="gestion-seccion">
      <section className="tarjeta">
        <h2>
          Fotos del vuelo ({fotos.length}/{MAXIMO_FOTOS})
        </h2>
        <p className="texto-suave">La primera foto es la que se muestra en la búsqueda y en el inicio.</p>

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {exito && <div className="mensaje mensaje-exito">{exito}</div>}

        {fotos.length === 0 ? (
          <div className="gestion-vacio">Todavía no subiste fotos. Sin fotos se muestra un fondo azul con el destino.</div>
        ) : (
          <div className="gestion-fotos">
            {fotos.map((foto, indice) => (
              <figure key={foto.id} className="gestion-foto">
                <img src={urlFoto(foto.id)} alt={foto.nombreArchivo} />
                {indice === 0 && <span className="etiqueta">Portada</span>}
                <div>
                  <span className="texto-suave">{Math.round(foto.tamano / 1024)} KB</span>
                  <button onClick={() => eliminar(foto)}>Eliminar</button>
                </div>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="tarjeta">
        <h2>Subir foto</h2>
        {lleno ? (
          <p className="texto-suave">Llegaste al máximo de {MAXIMO_FOTOS} fotos. Eliminá una para subir otra.</p>
        ) : (
          <form onSubmit={subir}>
            <div className="campo">
              <label htmlFor="archivo">Imagen (JPG, PNG o WEBP, hasta {MAXIMO_MB} MB)</label>
              <input id="archivo" ref={inputArchivo} type="file" accept="image/*" onChange={elegirArchivo} />
            </div>
            <button className="boton boton-primario boton-ancho" disabled={!archivo || subiendo}>
              {subiendo ? 'Subiendo…' : 'Subir foto'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

export default TabFotos
