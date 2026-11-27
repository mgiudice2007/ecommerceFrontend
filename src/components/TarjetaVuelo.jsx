import { Link } from 'react-router-dom'
import { diasHastaLlegada, duracion, fechaConDia, hora, precio } from '../utils/formato'
import { estaOperativo, precioDesde, textoDescuento } from '../utils/vuelos'
import FotoVuelo from './FotoVuelo'
import './TarjetaVuelo.css'
import Etiqueta from './comunes/Etiqueta'
import EtiquetaEstado from './comunes/EtiquetaEstado'

function TarjetaVuelo({ vuelo, pasajeros = '', imagen }) {
  const descuento = textoDescuento(vuelo)
  const desde = precioDesde(vuelo)
  const diasDespues = diasHastaLlegada(vuelo.fechaSalida, vuelo.fechaLlegada)

  return (
    <div className={`pase-vuelo ${descuento ? 'pase-vuelo-con-oferta' : ''}`.trim()}>
      <article className="tarjeta tarjeta-vuelo">
        <Link to={`/vuelos/${vuelo.id}${pasajeros}`} className="tarjeta-vuelo-foto" tabIndex={-1} aria-hidden="true">
          <FotoVuelo imagen={imagen} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
        </Link>

        <div className="tarjeta-vuelo-info">
          <div className="tarjeta-vuelo-encabezado">
            <span className="tarjeta-vuelo-avion" aria-hidden="true">✈</span>
            <div>
              <strong>
                {vuelo.origenCiudad} → {vuelo.destinoCiudad}
              </strong>
              <small>
                Vuelo {vuelo.numeroVuelo} · {vuelo.categoriaNombre}
              </small>
            </div>
            {descuento && <Etiqueta tipo="descuento">{descuento}</Etiqueta>}
            {vuelo.estado !== 'ACTIVO' && (
              <EtiquetaEstado estado={vuelo.estado} />
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
              <span>
                <i aria-hidden="true">✈</i>
              </span>
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
          <span className="tarjeta-vuelo-talon">Pase de abordar · {vuelo.numeroVuelo}</span>
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
          <Link to={`/vuelos/${vuelo.id}${pasajeros}`} className="boton boton-accion">
            Ver vuelo
          </Link>
        </div>
      </article>
    </div>
  )
}

export default TarjetaVuelo
