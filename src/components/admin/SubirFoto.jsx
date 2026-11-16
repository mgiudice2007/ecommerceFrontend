import { useState } from 'react'
import ConfirmarPregunta from '../ConfirmarPregunta'
import Campo from '../comunes/Campo'

const MAXIMO_MB = 5

function SubirFoto({ lleno, maximo, subiendo, onSubir, onError }) {
  const [archivo, setArchivo] = useState(null)
  const [pregunta, setPregunta] = useState(null)

  const elegirArchivo = (e) => {
    const elegido = e.target.files[0] ?? null
    onError(null)
    if (elegido && elegido.size > MAXIMO_MB * 1024 * 1024) {
      onError(`La foto pesa más de ${MAXIMO_MB} MB`)
      setArchivo(null)
      return
    }
    setArchivo(elegido)
  }

  const pedirConfirmacion = (e) => {
    e.preventDefault()
    if (!archivo) return
    const formulario = e.target
    setPregunta({
      titulo: '¿Subir esta foto?',
      mensaje: 'Se va a ver en la página del vuelo.',
      detalle: [`Archivo: ${archivo.name}`, `Tamaño: ${Math.round(archivo.size / 1024)} KB`],
      textoConfirmar: 'Sí, subir',
      accion: () =>
        onSubir(archivo).then((ok) => {
          if (!ok) return
          setArchivo(null)
          formulario.reset()
        }),
    })
  }

  return (
    <section className="tarjeta">
      <h2>Subir foto</h2>
      {lleno ? (
        <p className="texto-suave">Llegaste al máximo de {maximo} fotos. Eliminá una para subir otra.</p>
      ) : (
        <form onSubmit={pedirConfirmacion}>
          <Campo id="archivo" etiqueta={`Imagen (JPG, PNG o WEBP, hasta ${MAXIMO_MB} MB)`}>
            <input id="archivo" type="file" accept="image/*" onChange={elegirArchivo} />
          </Campo>
          <button className="boton boton-primario boton-ancho" disabled={!archivo || subiendo}>
            {subiendo ? 'Subiendo…' : 'Subir foto'}
          </button>
        </form>
      )}

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default SubirFoto
