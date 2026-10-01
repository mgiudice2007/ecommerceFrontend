import { useState } from 'react'
import { urlFoto } from '../api/api'
import './GaleriaFotos.css'

// Foto grande + miniaturas. Al tocar una miniatura pasa a ser la grande.
// fotos: la lista que devuelve GET /api/fotos?vueloId=...
function GaleriaFotos({ fotos, destinoIata, destinoCiudad }) {
  const [seleccionada, setSeleccionada] = useState(0)

  if (fotos.length === 0) {
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
        src={urlFoto(fotos[seleccionada].id)}
        alt={`Foto ${seleccionada + 1} de ${destinoCiudad}`}
      />

      {fotos.length > 1 && (
        <div className="galeria-miniaturas">
          {fotos.map((foto, indice) => (
            <button
              key={foto.id}
              className={indice === seleccionada ? 'activa' : ''}
              onClick={() => setSeleccionada(indice)}
              aria-label={`Ver foto ${indice + 1}`}
            >
              <img src={urlFoto(foto.id)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default GaleriaFotos
