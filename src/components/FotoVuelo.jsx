import { useEffect, useState } from 'react'
import { api, urlFoto } from '../api/api'
import './FotoVuelo.css'

// Muestra la primera foto que el admin subio para el vuelo.
// Si no subio ninguna, muestra un fondo azul con el codigo del destino.
function FotoVuelo({ vueloId, destinoIata, destinoCiudad }) {
  const [fotoId, setFotoId] = useState(null)

  useEffect(() => {
    api(`/api/fotos?vueloId=${vueloId}`)
      .then((fotos) => setFotoId(fotos.length > 0 ? fotos[0].id : null))
      .catch(() => setFotoId(null))
  }, [vueloId])

  if (fotoId) {
    return <img className="foto-vuelo" src={urlFoto(fotoId)} alt={`Foto de ${destinoCiudad}`} />
  }

  return (
    <div className="foto-vuelo foto-vuelo-vacia" aria-hidden="true">
      <span>{destinoIata || '✈'}</span>
    </div>
  )
}

export default FotoVuelo
