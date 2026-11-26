import { useEffect } from 'react'
import './Avisos.css'

const SEGUNDOS_VISIBLE = 6

// Cada aviso se cierra solo a los pocos segundos, o antes si se toca la cruz
function Aviso({ aviso, onCerrar }) {
  useEffect(() => {
    const timer = setTimeout(() => onCerrar(aviso.id), SEGUNDOS_VISIBLE * 1000)
    return () => clearTimeout(timer)
  }, [aviso.id, onCerrar])

  return (
    <div className="aviso" role="status">
      <span className="aviso-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
          <path d="M16 9a3 3 0 0 1 0 6M19 6a7 7 0 0 1 0 12" />
        </svg>
      </span>
      <div className="aviso-texto">
        <small>Anuncio BCA</small>
        <p>{aviso.texto}</p>
      </div>
      <button type="button" className="aviso-cerrar" onClick={() => onCerrar(aviso.id)} aria-label="Cerrar aviso">
        ×
      </button>
      {/* Barra que se vacia en el mismo tiempo en que el aviso se cierra solo */}
      <span className="aviso-tiempo" style={{ animationDuration: `${SEGUNDOS_VISIBLE}s` }} aria-hidden="true" />
    </div>
  )
}

function Avisos({ avisos, onCerrar }) {
  return (
    <div className="avisos" aria-live="polite">
      {avisos.map((aviso) => (
        <Aviso key={aviso.id} aviso={aviso} onCerrar={onCerrar} />
      ))}
    </div>
  )
}

export default Avisos
