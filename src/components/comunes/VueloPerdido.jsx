import { Link } from 'react-router-dom'
import LetrasGiratorias from './LetrasGiratorias'
import './VueloPerdido.css'

// Pagina 404 como un cartel de aeropuerto: el vuelo que buscabas se perdio en el camino
function VueloPerdido() {
  return (
    <section className="vuelo-perdido">
      <span className="vuelo-perdido-orbita" aria-hidden="true">
        <span>✈</span>
      </span>

      <div className="vuelo-perdido-codigo">
        <LetrasGiratorias texto="404" />
      </div>

      <div className="vuelo-perdido-fila" aria-hidden="true">
        <span className="hora">--:--</span>
        <span>Destino desconocido</span>
        <span>Puerta 404</span>
        <span className="estado">Vuelo cancelado</span>
      </div>

      <h1>Este vuelo se perdió en el camino</h1>
      <p>La página que buscás no existe o cambió de puerta.</p>

      <Link to="/" className="boton boton-accion">
        Volver a la terminal ✈
      </Link>
    </section>
  )
}

export default VueloPerdido
