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
        ✓
      </span>
      <p>{aviso.texto}</p>
      <button type="button" className="aviso-cerrar" onClick={() => onCerrar(aviso.id)} aria-label="Cerrar aviso">
        ×
      </button>
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
