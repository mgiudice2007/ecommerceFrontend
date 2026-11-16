import { Link } from 'react-router-dom'
import { duracion, fechaLarga, precio } from '../../utils/formato'
import { textoDescuento, textoEstado } from '../../utils/vuelos'
import './PortadaVuelo.css'

function PortadaVuelo({ vuelo, imagen }) {
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)
  const fondo = imagen ? { backgroundImage: `url("${imagen}")` } : undefined

  return (
    <section className="detalle-portada" style={fondo}>
      <div className="contenedor">
        <nav className="detalle-migas">
          <Link to={`/vuelos?origen=${vuelo.origenIata}&destino=${vuelo.destinoIata}`}>Vuelos</Link> /{' '}
          {vuelo.origenCiudad} → {vuelo.destinoCiudad}
        </nav>
        <div className="detalle-portada-etiquetas">
          <span>{vuelo.categoriaNombre}</span>
          {descuento && <span className="oferta">{descuento}</span>}
          {vuelo.estado !== 'ACTIVO' && (
            <span className={`estado-${vuelo.estado.toLowerCase()}`}>{textoEstado(vuelo.estado)}</span>
          )}
        </div>
        <h1>
          {vuelo.origenCiudad} → {vuelo.destinoCiudad}
        </h1>
        <p>
          Vuelo {vuelo.numeroVuelo} · Directo · {duracion(vuelo.duracionMinutos)} · {fechaLarga(vuelo.fechaSalida)}
        </p>
      </div>
    </section>
  )
}

export default PortadaVuelo
