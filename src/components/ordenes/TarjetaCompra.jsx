import { Link } from 'react-router-dom'
import { fechaCorta, fechaLarga, hora, precio } from '../../utils/formato'
import { nombreTipo } from '../../utils/pasajeros'
import { momentoDeCompra, textoNumerosDeVuelo } from '../../utils/ordenes'
import { textoMedioPago } from '../../utils/pagos'
import FotoVuelo from '../FotoVuelo'
import EtiquetaOrden from './EtiquetaOrden'
import './TarjetaCompra.css'

function TarjetaCompra({ orden, imagen, cancelando, onCancelar }) {
  const momento = momentoDeCompra(orden)
  const cancelada = momento === 'cancelada'
  const pasajes = orden.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <article className={`tarjeta compra compra-${momento}`}>
      <div className="compra-foto" aria-hidden="true">
        <FotoVuelo imagen={imagen} destinoIata="" destinoCiudad={orden.items[0].destino} />
      </div>

      <div className="compra-contenido">
        <div className="compra-encabezado">
          <div>
            <span className="compra-rotulo">BCA Airlines · Compra #{orden.id}</span>
            <strong>{textoNumerosDeVuelo(orden)}</strong>
            <small>
              Comprada el {fechaLarga(orden.fecha)} · {pasajes} {pasajes === 1 ? 'pasaje' : 'pasajes'}
            </small>
            {orden.medioPago && <small>Pagado con {textoMedioPago(orden).toLowerCase()}</small>}
          </div>
          <EtiquetaOrden momento={momento} />
        </div>

        {/* Un renglon por tramo y tipo de pasajero, con la fecha y hora en que sale ese vuelo */}
        <ul className="compra-vuelos">
          {orden.items.map((item) => (
            <li key={item.id}>
              <span className="compra-avion" aria-hidden="true">
                ✈
              </span>
              <span className="compra-tramo">
                {item.origen} → {item.destino}
                <small>
                  Vuelo {item.numeroVuelo} · {item.claseNombre} · {nombreTipo(item.tipoPasajero)} × {item.cantidad}
                </small>
              </span>
              <span className="compra-salida">
                {fechaCorta(item.fechaSalida)}
                <small>{hora(item.fechaSalida)} hs</small>
              </span>
            </li>
          ))}
        </ul>

        <div className="compra-pie">
          <strong>{precio(orden.total)}</strong>
          <div className="compra-acciones">
            {orden.sePuedeCancelar && (
              <button className="boton boton-peligro" onClick={() => onCancelar(orden)} disabled={cancelando}>
                {cancelando ? 'Cancelando…' : 'Cancelar compra'}
              </button>
            )}
            {!cancelada && !orden.sePuedeCancelar && (
              <span className="compra-sin-cancelar">Ya no se puede cancelar</span>
            )}
            <Link to={`/mis-compras/${orden.id}`} className="boton boton-secundario">
              Ver detalle
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default TarjetaCompra
