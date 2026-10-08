import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import { fechaLarga, hora, precio } from '../utils/formato'
import { nombreTipo } from '../utils/pasajeros'
import FotoVuelo from './FotoVuelo'
import './ItemCarrito.css'

// Un item del carrito. Recibe el item (ItemCarritoResponse) y dos funciones
// del padre: onCambiarCantidad y onEliminar.
function ItemCarrito({ item, onCambiarCantidad, onEliminar, ocupado }) {
  // El carrito no trae la fecha ni los asientos que quedan, asi que
  // pedimos el vuelo para mostrarlos y para no dejar sumar de mas.
  const [vuelo, setVuelo] = useState(null)

  useEffect(() => {
    api(`/api/vuelos/${item.vueloId}`)
      .then(setVuelo)
      .catch(() => setVuelo(null))
  }, [item.vueloId])

  const disponibilidad = vuelo?.disponibilidades.find((d) => d.id === item.disponibilidadId)
  const maximo = disponibilidad?.asientosDisponibles ?? Infinity

  return (
    <article className="tarjeta item-carrito">
      <Link to={`/vuelos/${item.vueloId}`} className="item-carrito-foto" tabIndex={-1} aria-hidden="true">
        <FotoVuelo vueloId={item.vueloId} destinoIata={vuelo?.destinoIata ?? ''} destinoCiudad={item.destino} />
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
          {precio(item.precioUnitario)} por pasajero
        </p>
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

        <strong className="item-carrito-subtotal">{precio(item.subtotal)}</strong>

        <button className="item-carrito-eliminar" onClick={() => onEliminar(item)} disabled={ocupado}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default ItemCarrito
