import { precio } from '../utils/formato'
import './OpcionClase.css'

function OpcionClase({ disponibilidad, clase, seleccionada, onElegir }) {
  const conDescuento = disponibilidad.precioConDescuento < disponibilidad.precio
  const pocosAsientos = disponibilidad.hayStock && disponibilidad.asientosDisponibles <= 5

  return (
    <button
      type="button"
      className={`opcion-clase ${seleccionada ? 'seleccionada' : ''}`}
      onClick={() => onElegir(disponibilidad)}
      disabled={!disponibilidad.hayStock}
      aria-pressed={seleccionada}
    >
      <div className="opcion-clase-encabezado">
        <strong>{disponibilidad.claseNombre}</strong>
        {seleccionada && <span className="etiqueta">Elegida</span>}
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
