import { Link } from 'react-router-dom'
import { precio } from '../../utils/formato'
import { precioDesde } from '../../utils/vuelos'
import FotoVuelo from '../FotoVuelo'
import './ValijaVacia.css'

// Carrito vacio: una valija abierta y tres destinos en oferta para empezar a viajar
function ValijaVacia({ sugeridos, portadas }) {
  return (
    <section className="tarjeta valija-vacia">
      <span className="valija-vacia-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="7" width="16" height="13" rx="2" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M9 11v5M15 11v5" />
        </svg>
      </span>
      <h2>Tu valija está vacía</h2>
      <p className="texto-suave">
        {sugeridos.length > 0 ? 'Estos destinos tienen lugar para vos:' : 'Buscá un vuelo, elegí tu clase y agregalo para comprarlo.'}
      </p>

      {sugeridos.length > 0 && (
        <div className="valija-vacia-destinos">
          {sugeridos.map((vuelo) => (
            <Link key={vuelo.id} to={`/vuelos/${vuelo.id}`} className="valija-vacia-destino">
              <FotoVuelo imagen={portadas[vuelo.id]} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
              <span className="valija-vacia-texto">
                <small>{vuelo.destinoIata}</small>
                <strong>{vuelo.destinoCiudad}</strong>
                <span>desde {precio(precioDesde(vuelo).precioConDescuento)}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <Link to="/" className="boton boton-accion">
        Buscar vuelos
      </Link>
    </section>
  )
}

export default ValijaVacia
