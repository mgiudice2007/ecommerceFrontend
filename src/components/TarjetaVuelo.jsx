import { Link } from 'react-router-dom'
import { diasHastaLlegada, duracion, fechaConDia, hora, precio } from '../utils/formato'
import { estaOperativo, precioDesde, textoDescuento, textoEstado } from '../utils/vuelos'
import FotoVuelo from './FotoVuelo'
import './TarjetaVuelo.css'

// Una fila del listado de resultados. Recibe el vuelo completo por props.
// pasajeros: texto como "?adultos=2&ninos=1" para que el detalle arranque con esos pasajeros
function TarjetaVuelo({ vuelo, pasajeros = '' }) {
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)
  const desde = precioDesde(vuelo)
  const diasDespues = diasHastaLlegada(vuelo.fechaSalida, vuelo.fechaLlegada)

  return (
    <article className="tarjeta tarjeta-vuelo">
      <Link to={`/vuelos/${vuelo.id}${pasajeros}`} className="tarjeta-vuelo-foto" tabIndex={-1} aria-hidden="true">
        <FotoVuelo vueloId={vuelo.id} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
      </Link>

      <div className="tarjeta-vuelo-info">
        <div className="tarjeta-vuelo-encabezado">
          <span className="tarjeta-vuelo-avion" aria-hidden="true">✈</span>
          <div>
            {/* Como en las aerolineas: la ruta es el titulo y el numero de vuelo un dato secundario */}
            <strong>
              {vuelo.origenCiudad} → {vuelo.destinoCiudad}
            </strong>
            <small>
              Vuelo {vuelo.numeroVuelo} · {vuelo.categoriaNombre}
            </small>
          </div>
          {descuento && <span className="etiqueta etiqueta-descuento">{descuento}</span>}
          {vuelo.estado !== 'ACTIVO' && (
            <span className={`etiqueta estado-${vuelo.estado.toLowerCase()}`}>{textoEstado(vuelo.estado)}</span>
          )}
        </div>

        <p className="tarjeta-vuelo-fecha">📅 {fechaConDia(vuelo.fechaSalida)}</p>

        <div className="tarjeta-vuelo-horarios">
          <div>
            <small className="tarjeta-vuelo-rotulo">Sale</small>
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
            <small className="tarjeta-vuelo-rotulo">
              Llega
              {diasDespues > 0 && <span className="tarjeta-vuelo-dia-extra">+{diasDespues} día</span>}
            </small>
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
          <strong className="sin-stock">{estaOperativo(vuelo) ? 'Sin asientos' : 'No disponible'}</strong>
        )}
        <Link to={`/vuelos/${vuelo.id}${pasajeros}`} className="boton boton-primario">
          Ver vuelo
        </Link>
      </div>
    </article>
  )
}

export default TarjetaVuelo
