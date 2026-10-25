import { useEffect, useState } from 'react'
import { api, pedirImagen } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'

const MAXIMO_FOTOS = 5 // el backend no deja subir mas de 5 por vuelo
const MAXIMO_MB = 5

// Pestaña "Fotos": subir (multipart/form-data) y borrar fotos del vuelo.
function TabFotos({ vuelo, onCambio }) {
  const [fotos, setFotos] = useState([])
  const [imagenes, setImagenes] = useState([]) // la imagen (data URL) de cada foto, en el mismo orden
  const [archivo, setArchivo] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  // El cartel de confirmacion de la accion elegida: { titulo, mensaje, detalle, textoConfirmar, peligro, accion }
  const [pregunta, setPregunta] = useState(null)
  // Cada vez que cambia, el useEffect vuelve a pedir las fotos
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    // Primero la lista de fotos y despues la imagen (en Base64) de cada una
    api(`/api/fotos?vueloId=${vuelo.id}`)
      .then((data) => {
        setFotos(data)
        return Promise.all(data.map((foto) => pedirImagen(foto.id)))
      })
      .then((data) => setImagenes(data))
      .catch((err) => setError(err.message))
  }, [vuelo.id, recargar])

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

  // Antes de subir se muestra que archivo se va a subir y se pide confirmacion
  const subir = (e) => {
    e.preventDefault()
    if (!archivo) return
    const formulario = e.target // para vaciar el <input type="file"> despues de subir
    setPregunta({
      titulo: '¿Subir esta foto?',
      mensaje: 'Se va a ver en la página del vuelo.',
      detalle: [`Archivo: ${archivo.name}`, `Tamaño: ${Math.round(archivo.size / 1024)} KB`],
      textoConfirmar: 'Sí, subir',
      accion: () => subirFoto(formulario),
    })
  }

  const subirFoto = (formulario) => {

    // Igual que en la clase de subida de imagenes: los datos van en un FormData.
    // El campo del archivo se tiene que llamar "file", como espera el backend.
    const formData = new FormData()
    formData.append('vueloId', vuelo.id)
    formData.append('file', archivo)

    setSubiendo(true)
    setError('')
    setExito('')
    api('/api/fotos', { method: 'POST', body: formData })
      .then(() => {
        setExito('Foto subida.')
        setArchivo(null)
        formulario.reset()
        setRecargar(recargar + 1)
        onCambio()
      })
      .catch((err) => setError(err.message))
      .finally(() => setSubiendo(false))
  }

  const preguntarEliminar = (foto) => {
    setPregunta({
      titulo: '¿Eliminar esta foto?',
      mensaje: 'Deja de mostrarse en la página del vuelo.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => eliminar(foto),
    })
  }

  const eliminar = (foto) => {
    setError('')
    setExito('')
    api(`/api/fotos/${foto.id}`, { method: 'DELETE' })
      .then((respuesta) => {
        setExito(respuesta.mensaje) // "Foto eliminada correctamente"
        setRecargar(recargar + 1)
        onCambio()
      })
      .catch((err) => setError(err.message))
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
                {/* Mientras llega la imagen se ve el recuadro gris de fondo */}
                {imagenes[indice] && <img src={imagenes[indice]} alt={foto.nombreArchivo} />}
                {indice === 0 && <span className="etiqueta">Portada</span>}
                <div>
                  <span className="texto-suave">{Math.round(foto.tamano / 1024)} KB</span>
                  <button onClick={() => preguntarEliminar(foto)}>Eliminar</button>
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
              <input id="archivo" type="file" accept="image/*" onChange={elegirArchivo} />
            </div>
            <button className="boton boton-primario boton-ancho" disabled={!archivo || subiendo}>
              {subiendo ? 'Subiendo…' : 'Subir foto'}
            </button>
          </form>
        )}
      </section>

      {/* Renderizado condicional: el cartel aparece cuando hay una accion esperando confirmacion */}
      {pregunta && (
        <Confirmacion
          titulo={pregunta.titulo}
          mensaje={pregunta.mensaje}
          detalle={pregunta.detalle}
          textoConfirmar={pregunta.textoConfirmar}
          peligro={pregunta.peligro}
          onConfirmar={() => {
            setPregunta(null)
            pregunta.accion()
          }}
          onCancelar={() => setPregunta(null)}
        />
      )}
    </div>
  )
}

export default TabFotos
