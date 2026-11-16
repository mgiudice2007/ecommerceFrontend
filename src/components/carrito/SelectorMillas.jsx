import { millas, precio } from '../../utils/formato'
import { sinRuedita } from '../../utils/validaciones'
import Campo from '../comunes/Campo'
import './SelectorMillas.css'

function SelectorMillas({ usar, onUsar, disponibles, valorMilla, maximo, elegidas, onElegir, problema }) {
  return (
    <div className="carrito-millas">
      <label className="carrito-millas-casilla">
        <input type="checkbox" checked={usar} disabled={disponibles === 0} onChange={(e) => onUsar(e.target.checked)} />
        <span>
          Usar <strong>millas + dinero</strong>
          <small>
            Tenés {millas(disponibles)} millas · cada milla vale {precio(valorMilla)}
          </small>
        </span>
      </label>

      {usar && (
        <Campo id="millas" etiqueta={`Millas a usar (máximo ${millas(maximo)})`}>
          <input
            id="millas"
            type="number"
            onWheel={sinRuedita}
            min="0"
            max={maximo}
            value={elegidas}
            onChange={(e) => onElegir(e.target.value)}
          />
          {problema && <small className="carrito-millas-error">{problema}</small>}
        </Campo>
      )}
    </div>
  )
}

export default SelectorMillas
