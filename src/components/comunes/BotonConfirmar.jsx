import { useId } from 'react'
import './BotonConfirmar.css'

// Botón de una acción que borra algo: el primer clic no borra, abre una burbuja flotante "¿Seguro? Sí / No"
// pegada al botón. La burbuja usa el atributo `popover` de HTML: el navegador la abre y la cierra solo
// (con el botón, con Escape o tocando afuera) y la dibuja por encima de todo, así que no corre la fila ni
// la recorta una tabla o una tarjeta. No hace falta estado ni tocar el DOM.
function BotonConfirmar({ texto, textoConfirmar = 'Sí, eliminar', className = 'boton boton-peligro', disabled = false, onConfirmar }) {
  // useId da un id único por botón; el "ancla" de CSS necesita un nombre que empiece con --
  const id = useId()
  const ancla = `--confirmar-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <>
      <button
        type="button"
        className={className}
        popoverTarget={id}
        disabled={disabled}
        style={{ anchorName: ancla }}
      >
        {texto}
      </button>

      <div id={id} popover="auto" className="boton-confirmar" role="alertdialog" aria-label={`¿Seguro? ${texto}`} style={{ positionAnchor: ancla }}>
        <span className="boton-confirmar-pregunta">¿Seguro?</span>
        <span className="boton-confirmar-botones">
          <button type="button" className="boton-confirmar-no" popoverTarget={id} popoverTargetAction="hide">
            No
          </button>
          <button type="button" className="boton-confirmar-si" popoverTarget={id} popoverTargetAction="hide" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </span>
      </div>
    </>
  )
}

export default BotonConfirmar
