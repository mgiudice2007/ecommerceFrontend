import './SelectorTipoViaje.css'

const OPCIONES = [
  { valor: 'idavuelta', texto: 'Ida y vuelta' },
  { valor: 'ida', texto: 'Solo ida' },
]

// Interruptor de dos opciones: una pastilla blanca con un avioncito se desliza hasta la elegida
function SelectorTipoViaje({ viaje, onCambiar }) {
  return (
    <div className={`buscador-viaje ${viaje === 'ida' ? 'en-segunda' : ''}`} role="radiogroup" aria-label="Tipo de viaje">
      <span className="buscador-viaje-pastilla" aria-hidden="true" />
      {OPCIONES.map((opcion) => (
        <label key={opcion.valor} className={viaje === opcion.valor ? 'activo' : ''}>
          <input
            type="radio"
            name="viaje"
            value={opcion.valor}
            checked={viaje === opcion.valor}
            onChange={() => onCambiar(opcion.valor)}
          />
          {viaje === opcion.valor && (
            <span className="buscador-viaje-avion" aria-hidden="true">
              ✈
            </span>
          )}
          {opcion.texto}
        </label>
      ))}
    </div>
  )
}

export default SelectorTipoViaje
