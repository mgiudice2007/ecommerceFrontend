import { useState } from 'react'
import ConfirmarPregunta from '../ConfirmarPregunta'
import Etiqueta from '../comunes/Etiqueta'
import SinDatos from '../comunes/SinDatos'
import './GrillaFotos.css'

function GrillaFotos({ fotos, imagenes, maximo, onEliminar }) {
  const [pregunta, setPregunta] = useState(null)

  const preguntarEliminar = (foto) => {
    setPregunta({
      titulo: '¿Eliminar esta foto?',
      mensaje: 'Deja de mostrarse en la página del vuelo.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => onEliminar(foto),
    })
  }

  return (
    <section className="tarjeta">
      <h2>
        Fotos del vuelo ({fotos.length}/{maximo})
      </h2>
      <p className="texto-suave">La primera foto es la que se muestra en la búsqueda y en el inicio.</p>

      {fotos.length === 0 ? (
        <SinDatos>Todavía no subiste fotos. Sin fotos se muestra un fondo azul con el destino.</SinDatos>
      ) : (
        <div className="gestion-fotos">
          {fotos.map((foto, indice) => (
            <figure key={foto.id} className="gestion-foto">
              {imagenes[indice] && <img src={imagenes[indice]} alt={foto.nombreArchivo} />}
              {indice === 0 && <Etiqueta>Portada</Etiqueta>}
              <div>
                <span className="texto-suave">{Math.round(foto.tamano / 1024)} KB</span>
                <button onClick={() => preguntarEliminar(foto)}>Eliminar</button>
              </div>
            </figure>
          ))}
        </div>
      )}

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default GrillaFotos
