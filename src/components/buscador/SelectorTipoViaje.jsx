import './SelectorTipoViaje.css'

const OPCIONES = [
  { valor: 'idavuelta', texto: 'Ida y vuelta' },
  { valor: 'ida', texto: 'Solo ida' },
]

function SelectorTipoViaje({ viaje, onCambiar }) {
  return (
    <div className="buscador-viaje" role="radiogroup" aria-label="Tipo de viaje">
      {OPCIONES.map((opcion) => (
        <label key={opcion.valor} className={viaje === opcion.valor ? 'activo' : ''}>
          <input
            type="radio"
            name="viaje"
            value={opcion.valor}
            checked={viaje === opcion.valor}
            onChange={() => onCambiar(opcion.valor)}
          />
          {viaje === opcion.valor && <span aria-hidden="true">✓ </span>}
          {opcion.texto}
        </label>
      ))}
    </div>
  )
}

export default SelectorTipoViaje
