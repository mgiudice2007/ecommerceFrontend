import './Avisos.css'

function Avisos({ avisos, onCerrar }) {
  return (
    <div className="avisos" aria-live="polite">
      {avisos.map((aviso) => (
        <div key={aviso.id} className="aviso" role="status">
          <span className="aviso-icono" aria-hidden="true">
            ✓
          </span>
          <p>{aviso.texto}</p>
          <button type="button" className="aviso-cerrar" onClick={() => onCerrar(aviso.id)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Avisos
