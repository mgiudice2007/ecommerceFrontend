import { fotoDelDestino } from '../utils/fotosDestino'
import './FotoVuelo.css'

// Foto del vuelo: la propia si la tiene; si no, la foto del destino; y si el destino no
// tiene foto de respaldo, el recuadro azul con el codigo del aeropuerto
function FotoVuelo({ imagen, destinoIata, destinoCiudad }) {
  const foto = imagen || fotoDelDestino(destinoIata, destinoCiudad)

  if (foto) {
    return <img className="foto-vuelo" src={foto} alt={`Foto de ${destinoCiudad}`} loading="lazy" />
  }

  return (
    <div className="foto-vuelo foto-vuelo-vacia" aria-hidden="true">
      <span>{destinoIata || '✈'}</span>
    </div>
  )
}

export default FotoVuelo
