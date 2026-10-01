import { Link } from 'react-router-dom'
import { fechaCorta, precio } from '../utils/formato'
import { precioDesde, textoDescuento } from '../utils/vuelos'
import FotoVuelo from './FotoVuelo'
import './TarjetaDestino.css'

// Tarjeta con foto para los "Destinos destacados" del inicio.
function TarjetaDestino({ vuelo }) {
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)

  return (
    <Link to={`/vuelos/${vuelo.id}`} className="tarjeta-destino">
      <div className="tarjeta-destino-foto">
        <FotoVuelo vueloId={vuelo.id} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
        <span className="etiqueta">{descuento ?? vuelo.categoriaNombre}</span>
      </div>

      <div className="tarjeta-destino-cuerpo">
        <h3>{vuelo.destinoCiudad}</h3>
        <p className="texto-suave">
          Desde {vuelo.origenCiudad} ({vuelo.origenIata}) · {fechaCorta(vuelo.fechaSalida)}
        </p>
        <div className="tarjeta-destino-pie">
          <div>
            <small>Final por pasajero</small>
            <strong>{precio(precioDesde(vuelo).precioConDescuento)}</strong>
          </div>
          <span className="tarjeta-destino-flecha" aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  )
}

export default TarjetaDestino
