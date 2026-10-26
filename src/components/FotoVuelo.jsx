import './FotoVuelo.css'

function FotoVuelo({ imagen, destinoIata, destinoCiudad }) {
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
