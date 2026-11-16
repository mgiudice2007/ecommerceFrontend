import { Link } from 'react-router-dom'
import { fechaLarga, hora, precio } from '../../utils/formato'
import { textoNumerosDeVuelo } from '../../utils/ordenes'
import FotoVuelo from '../FotoVuelo'
import EtiquetaOrden from './EtiquetaOrden'
import './TarjetaCompra.css'

function TarjetaCompra({ orden, cancelando, onCancelar }) {
  const cancelada = orden.estado === 'CANCELADA'
  const pasajes = orden.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <article className={`tarjeta compra ${cancelada ? 'compra-cancelada' : ''}`}>
      <div className="compra-foto" aria-hidden="true">
        <FotoVuelo destinoIata="" destinoCiudad={orden.items[0].destino} />
      </div>

      <div className="compra-contenido">
        <div className="compra-encabezado">
          <div>
            <strong>
              Compra #{orden.id} · {textoNumerosDeVuelo(orden)}
            </strong>
            <small>
              {fechaLarga(orden.fecha)} · {hora(orden.fecha)} hs · {pasajes} {pasajes === 1 ? 'pasaje' : 'pasajes'}
            </small>
          </div>
          <EtiquetaOrden cancelada={cancelada} />
        </div>

        <ul className="compra-vuelos">
          {orden.items.map((item) => (
            <li key={item.id}>
              {item.origen} → {item.destino}
              <small>
                {' '}
                · Vuelo {item.numeroVuelo} · {item.claseNombre} × {item.cantidad}
              </small>
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
