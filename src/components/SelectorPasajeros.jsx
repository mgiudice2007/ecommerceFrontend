import { MAXIMO_PASAJEROS, TIPOS_PASAJERO, totalPasajeros } from '../utils/pasajeros'
import './SelectorPasajeros.css'

// Elegir cuántos adultos, niños y bebés viajan, con botones - y +.
// pasajeros: { adultos, ninos, bebes }   onChange: recibe el objeto nuevo
// maximo: tope de asientos (por ejemplo los que quedan en la clase elegida)
function SelectorPasajeros({ pasajeros, onChange, maximo = MAXIMO_PASAJEROS }) {
  const tope = Math.min(maximo, MAXIMO_PASAJEROS)
  const total = totalPasajeros(pasajeros)

  const cambiar = (clave, cantidad) => {
    onChange({ ...pasajeros, [clave]: cantidad })
  }

  // Reglas como en LATAM: siempre viaja al menos un adulto y cada bebé va a upa de un adulto
  const puedeRestar = (clave) => {
    if (clave === 'adultos') return pasajeros.adultos > 1 && pasajeros.adultos > pasajeros.bebes
    return pasajeros[clave] > 0
  }

  const puedeSumar = (clave) => {
    if (total >= tope) return false
    if (clave === 'bebes') return pasajeros.bebes < pasajeros.adultos
    return true
  }

  return (
    <div className="selector-pasajeros">
      {TIPOS_PASAJERO.map((t) => (
        <div key={t.clave} className="selector-pasajeros-fila">
          <div>
            <strong>{t.titulo}</strong>
            <small>{t.detalle}</small>
          </div>
          <div className="contador">
            <button
              type="button"
              onClick={() => cambiar(t.clave, pasajeros[t.clave] - 1)}
              disabled={!puedeRestar(t.clave)}
              aria-label={`Restar ${t.singular}`}
            >
              −
            </button>
            <span>{pasajeros[t.clave]}</span>
            <button
              type="button"
              onClick={() => cambiar(t.clave, pasajeros[t.clave] + 1)}
              disabled={!puedeSumar(t.clave)}
              aria-label={`Sumar ${t.singular}`}
            >
              +
            </button>
          </div>
        </div>
      ))}
      {total >= tope && <p className="selector-pasajeros-aviso">Máximo {tope} pasajeros por compra.</p>}
    </div>
  )
}

export default SelectorPasajeros
