import { Link } from 'react-router-dom'
import { fechaLarga, hora, precioOGratis } from '../utils/formato'
import { nombreTipo } from '../utils/pasajeros'
import FotoVuelo from './FotoVuelo'
import './ItemCarrito.css'

// Un item del carrito. Recibe el item (ItemCarritoResponse) y dos funciones
// del padre: onCambiarCantidad y onEliminar.
// vuelo lo pide el Carrito: el item no trae la fecha ni los asientos que quedan,
// y con el vuelo se muestran y no se deja sumar de mas.
function ItemCarrito({ item, vuelo, onCambiarCantidad, onEliminar, ocupado }) {
  const disponibilidad = vuelo?.disponibilidades.find((d) => d.id === item.disponibilidadId)
  const maximo = disponibilidad?.asientosDisponibles ?? Infinity

  return (
    <article className="tarjeta item-carrito">
      <Link to={`/vuelos/${item.vueloId}`} className="item-carrito-foto" tabIndex={-1} aria-hidden="true">
        <FotoVuelo destinoIata={vuelo?.destinoIata ?? ''} destinoCiudad={item.destino} />
      </Link>

      <div className="item-carrito-info">
        <span className="etiqueta">Vuelo {item.numeroVuelo}</span>
        <h3>
          <Link to={`/vuelos/${item.vueloId}`}>
            {item.origen} → {item.destino}
          </Link>
        </h3>
        {vuelo && (
          <p className="texto-suave">
            {fechaLarga(vuelo.fechaSalida)} · sale {hora(vuelo.fechaSalida)} hs ({vuelo.origenIata} →{' '}
            {vuelo.destinoIata})
          </p>
        )}
        <p className="item-carrito-clase">
          Clase <strong>{item.claseNombre}</strong> · <strong>{nombreTipo(item.tipoPasajero)}</strong> ·{' '}
          {precioOGratis(item.precioUnitario)} por pasajero
        </p>
        {item.tipoPasajero === 'BEBE' ? (
          <p className="texto-suave">Viaja a upa, sin asiento propio</p>
        ) : (
          <p className="texto-suave">
            {item.asientos.length > 0 && (
              <>
                {item.asientos.length === 1 ? 'Asiento' : 'Asientos'}: <strong>{item.asientos.join(', ')}</strong>
              </>
            )}
            {item.asientos.length < item.cantidad &&
              `${item.asientos.length > 0 ? ' · ' : ''}${item.cantidad - item.asientos.length === 1 ? 'Un asiento se asigna' : 'Los asientos que faltan se asignan'} al confirmar`}
          </p>
        )}
      </div>

      <div className="item-carrito-acciones">
        <div className="contador">
          <button
            onClick={() => onCambiarCantidad(item, item.cantidad - 1)}
            disabled={ocupado || item.cantidad <= 1}
            aria-label="Restar un pasaje"
          >
            −
          </button>
          <span>{item.cantidad}</span>
          <button
            onClick={() => onCambiarCantidad(item, item.cantidad + 1)}
            disabled={ocupado || item.cantidad >= maximo}
            aria-label="Sumar un pasaje"
          >
            +
          </button>
        </div>

        <strong className="item-carrito-subtotal">{precioOGratis(item.subtotal)}</strong>

        <button className="item-carrito-eliminar" onClick={() => onEliminar(item)} disabled={ocupado}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default ItemCarrito
