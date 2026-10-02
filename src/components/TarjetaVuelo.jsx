import { Link } from 'react-router-dom'
import { duracion, fechaCorta, hora, precio } from '../utils/formato'
import { precioDesde, textoDescuento } from '../utils/vuelos'
import FotoVuelo from './FotoVuelo'
import './TarjetaVuelo.css'

// Una fila del listado de resultados. Recibe el vuelo completo por props.
function TarjetaVuelo({ vuelo }) {
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)
  const desde = precioDesde(vuelo)

  return (
    <article className="tarjeta tarjeta-vuelo">
      <Link to={`/vuelos/${vuelo.id}`} className="tarjeta-vuelo-foto" tabIndex={-1} aria-hidden="true">
        <FotoVuelo vueloId={vuelo.id} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
      </Link>

      <div className="tarjeta-vuelo-info">
        <div className="tarjeta-vuelo-encabezado">
          <span className="tarjeta-vuelo-avion" aria-hidden="true">✈</span>
          <div>
            <strong>Vuelo {vuelo.numeroVuelo}</strong>
            <small>
              {vuelo.categoriaNombre} · {fechaCorta(vuelo.fechaSalida)}
            </small>
          </div>
          {descuento && <span className="etiqueta etiqueta-descuento">{descuento}</span>}
        </div>

        <div className="tarjeta-vuelo-horarios">
          <div>
            <strong>{hora(vuelo.fechaSalida)}</strong>
            <span>{vuelo.origenIata}</span>
            <small>{vuelo.origenCiudad}</small>
          </div>

          <div className="tarjeta-vuelo-linea">
            <small>{duracion(vuelo.duracionMinutos)}</small>
            <span />
            <small>Directo</small>
          </div>

          <div className="derecha">
            <strong>{hora(vuelo.fechaLlegada)}</strong>
            <span>{vuelo.destinoIata}</span>
            <small>{vuelo.destinoCiudad}</small>
          </div>
        </div>

        <ul className="tarjeta-vuelo-clases">
          {vuelo.disponibilidades.map((d) => (
            <li key={d.id} className={d.hayStock ? '' : 'agotada'}>
              {d.claseNombre} · {d.hayStock ? precio(d.precioConDescuento) : 'Agotada'}
            </li>
          ))}
        </ul>
      </div>

      <div className="tarjeta-vuelo-precio">
        {vuelo.hayStock ? (
          <>
            <small>Desde</small>
            {desde.precio > desde.precioConDescuento && <s>{precio(desde.precio)}</s>}
            <strong>{precio(desde.precioConDescuento)}</strong>
            <small>por pasajero</small>
          </>
        ) : (
          <strong className="sin-stock">Sin asientos</strong>
        )}
        <Link to={`/vuelos/${vuelo.id}`} className="boton boton-primario">
          Ver vuelo
        </Link>
      </div>
    </article>
  )
}

export default TarjetaVuelo
