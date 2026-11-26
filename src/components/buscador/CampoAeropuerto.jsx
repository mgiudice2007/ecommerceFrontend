import { etiquetaAeropuerto } from '../../utils/buscador'
import './CampoAeropuerto.css'

// Campo de texto con lista de aeropuertos que se filtra al escribir.
function CampoAeropuerto({
  id,
  etiqueta,
  codigo,
  placeholder,
  valor,
  sugerencias,
  detalleDe,
  textoSinSugerencias,
  abierto,
  onAbrir,
  onCerrar,
  onEscribir,
  onElegir,
}) {
  return (
    <div className="buscador-campo">
      <label htmlFor={id}>{etiqueta}</label>
      {/* El codigo del aeropuerto elegido se ve grande, como en un pasaje */}
      <span className={`buscador-iata ${codigo ? '' : 'vacio'}`} aria-hidden="true">
        {codigo || '···'}
      </span>
      <input
        id={id}
        value={valor}
        onChange={(e) => onEscribir(e.target.value)}
        onFocus={onAbrir}
        onBlur={onCerrar}
        placeholder={placeholder}
        autoComplete="off"
      />
      {abierto && (
        <ul className="buscador-sugerencias" role="listbox">
          {sugerencias.map((a) => (
            <li key={a.codigoIata}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onElegir(a)
                }}
              >
                <strong>{etiquetaAeropuerto(a)}</strong>
                <small>{detalleDe(a)}</small>
              </button>
            </li>
          ))}
          {sugerencias.length === 0 && <li className="buscador-sin-sugerencias">{textoSinSugerencias}</li>}
        </ul>
      )}
    </div>
  )
}

export default CampoAeropuerto
