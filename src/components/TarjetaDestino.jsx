import { Link } from 'react-router-dom'
import { fechaCorta, precio } from '../utils/formato'
import { precioDesde, textoDescuento } from '../utils/vuelos'
import FotoVuelo from './FotoVuelo'
import './TarjetaDestino.css'

// Tarjeta con foto grande para las secciones del inicio.
// pais: viene del catalogo de aeropuertos (el vuelo solo trae la ciudad)
function TarjetaDestino({ vuelo, pais }) {
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)
  const desde = precioDesde(vuelo)
  const conRebaja = desde.precioConDescuento < desde.precio

  return (
    <Link to={`/vuelos/${vuelo.id}`} className="tarjeta-destino">
      <div className="tarjeta-destino-foto">
        <FotoVuelo vueloId={vuelo.id} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
      </div>

      {descuento && <span className="tarjeta-destino-oferta">{descuento}</span>}

      <div className="tarjeta-destino-texto">
        <span className="tarjeta-destino-pais">{pais ?? vuelo.categoriaNombre}</span>
        <h3>{vuelo.destinoCiudad}</h3>
        <span className="tarjeta-destino-ruta">
          Desde {vuelo.origenCiudad} · {fechaCorta(vuelo.fechaSalida)}
        </span>

        <div className="tarjeta-destino-precio">
          <small>Ida desde</small>
          {conRebaja && <s>{precio(desde.precio)}</s>}
          <strong>{precio(desde.precioConDescuento)}</strong>
        </div>
      </div>
    </Link>
  )
}

export default TarjetaDestino
