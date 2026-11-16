import TarjetaDestino from '../TarjetaDestino'
import './SeccionDestinos.css'

function GrillaDestinos({ vuelos, paisDe, portadas }) {
  return (
    <div className="inicio-grilla">
      {vuelos.map((vuelo) => (
        <TarjetaDestino key={vuelo.id} vuelo={vuelo} pais={paisDe(vuelo.destinoIata)} imagen={portadas[vuelo.id]} />
      ))}
    </div>
  )
}

export default GrillaDestinos
