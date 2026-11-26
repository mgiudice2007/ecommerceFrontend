import { precio } from '../utils/formato'
import './OpcionClase.css'

// Cada clase embarca en una zona, como en el aeropuerto: Primera sube primero
const zonaDe = (nombre = '') => {
  const clase = nombre.toLowerCase()
  if (clase.includes('primera')) return { numero: 1, tono: 'primera' }
  if (clase.includes('ejecutiva')) return { numero: 2, tono: 'ejecutiva' }
  return { numero: 3, tono: 'economica' }
}

function OpcionClase({ disponibilidad, clase, seleccionada, onElegir }) {
  const conDescuento = disponibilidad.precioConDescuento < disponibilidad.precio
  const pocosAsientos = disponibilidad.hayStock && disponibilidad.asientosDisponibles <= 5
  const zona = zonaDe(disponibilidad.claseNombre)

  return (
    <button
      type="button"
      className={`opcion-clase zona-${zona.tono} ${seleccionada ? 'seleccionada' : ''}`}
      onClick={() => onElegir(disponibilidad)}
      disabled={!disponibilidad.hayStock}
      aria-pressed={seleccionada}
    >
      <span className="opcion-clase-zona">
        Zona {zona.numero}
        <span>Embarque</span>
      </span>

      <div className="opcion-clase-encabezado">
        <strong>{disponibilidad.claseNombre}</strong>
        {seleccionada && <span className="sello">Elegida</span>}
      </div>

      {clase && <p>{clase.descripcion}</p>}

      <ul>
        <li className={clase?.equipajeBodega ? '' : 'no-incluye'}>
          {clase?.equipajeBodega ? '✓ Valija en bodega incluida' : '✕ Sin valija en bodega'}
        </li>
      </ul>

      <div className="opcion-clase-precio">
        {disponibilidad.hayStock ? (
          <>
            <small>Precio final por pasajero</small>
            {conDescuento && <s>{precio(disponibilidad.precio)}</s>}
            <strong>{precio(disponibilidad.precioConDescuento)}</strong>
            <small className={pocosAsientos ? 'pocos' : ''}>
              {pocosAsientos
                ? `¡Quedan solo ${disponibilidad.asientosDisponibles}!`
                : `${disponibilidad.asientosDisponibles} asientos disponibles`}
            </small>
          </>
        ) : (
          <strong className="agotada">Agotada</strong>
        )}
      </div>
    </button>
  )
}

export default OpcionClase
