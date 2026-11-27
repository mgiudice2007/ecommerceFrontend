import { Link } from 'react-router-dom'
import { duracion, fechaLarga } from '../../utils/formato'
import { textoDescuento, textoEstado } from '../../utils/vuelos'
import './PortadaVuelo.css'

function PortadaVuelo({ vuelo, imagen }) {
  const descuento = textoDescuento(vuelo)
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
          {descuento && <span className="oferta cartel-descuento">{descuento}</span>}
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

        {/* Ventanilla del avion: se ve el destino y la persiana sube sola al entrar */}
        <div className="ventanilla" aria-hidden="true">
          <div className="ventanilla-vista" style={fondo} />
          <span className="ventanilla-persiana" />
        </div>
      </div>
    </section>
  )
}

export default PortadaVuelo
