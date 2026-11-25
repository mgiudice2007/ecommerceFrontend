import { useState } from 'react'
import './BotonConfirmar.css'

// Botón de una acción que borra algo: el primer clic no hace nada, convierte el botón en "¿Seguro? Sí / No"
// en el mismo lugar. Es estado de la interfaz, por eso vive acá y no en quien lo usa.
function BotonConfirmar({ texto, textoConfirmar = 'Sí, eliminar', className = 'boton boton-peligro', disabled = false, onConfirmar }) {
  const [preguntando, setPreguntando] = useState(false)

  if (!preguntando) {
    return (
      <button type="button" className={className} onClick={() => setPreguntando(true)} disabled={disabled}>
        {texto}
      </button>
    )
  }

  return (
    <span className="boton-confirmar" role="group" aria-label="Confirmar acción">
      <span>¿Seguro?</span>
      <button
        type="button"
        className="boton-confirmar-si"
        onClick={() => {
          setPreguntando(false)
          onConfirmar()
        }}
        autoFocus
      >
        {textoConfirmar}
      </button>
      <button type="button" className="boton-confirmar-no" onClick={() => setPreguntando(false)}>
        No
      </button>
    </span>
  )
}

export default BotonConfirmar
