import { useEffect, useState } from 'react'
import { api, pedirImagen } from '../api/api'
import './FotoVuelo.css'

// Muestra la primera foto que el admin subio para el vuelo.
// Si no subio ninguna, muestra un fondo azul con el codigo del destino.
function FotoVuelo({ vueloId, destinoIata, destinoCiudad }) {
  const [imagen, setImagen] = useState(null)

  useEffect(() => {
    // Primero la lista de fotos del vuelo y despues la imagen (en Base64) de la primera
    api(`/api/fotos?vueloId=${vueloId}`)
      .then((fotos) => (fotos.length > 0 ? pedirImagen(fotos[0].id) : null))
      .then((data) => setImagen(data))
      .catch(() => setImagen(null))
  }, [vueloId])

  if (imagen) {
    return <img className="foto-vuelo" src={imagen} alt={`Foto de ${destinoCiudad}`} />
  }

  return (
    <div className="foto-vuelo foto-vuelo-vacia" aria-hidden="true">
      <span>{destinoIata || '✈'}</span>
    </div>
  )
}

export default FotoVuelo
