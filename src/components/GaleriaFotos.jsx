import { useState } from 'react'
import './GaleriaFotos.css'

function GaleriaFotos({ imagenes, destinoIata, destinoCiudad }) {
  const [seleccionada, setSeleccionada] = useState(0)

  if (imagenes.length === 0) {
    return (
      <div className="galeria-principal galeria-vacia">
        <span>{destinoIata}</span>
        <small>{destinoCiudad}</small>
      </div>
    )
  }

  return (
    <div className="galeria">
      <img
        className="galeria-principal"
        src={imagenes[seleccionada]}
        alt={`Foto ${seleccionada + 1} de ${destinoCiudad}`}
      />

      {imagenes.length > 1 && (
        <div className="galeria-miniaturas">
          {imagenes.map((imagen, indice) => (
            <button
              key={indice}
              className={indice === seleccionada ? 'activa' : ''}
              onClick={() => setSeleccionada(indice)}
              aria-label={`Ver foto ${indice + 1}`}
            >
              <img src={imagen} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GaleriaFotos
