// El estado de la compra es un sello: verde si esta confirmada, rojo si se cancelo
function EtiquetaOrden({ cancelada }) {
  return (
    <span className={`sello ${cancelada ? 'sello-cancelada' : 'sello-exito'}`}>
      {cancelada ? 'Cancelada' : 'Confirmada'}
    </span>
  )
}

export default EtiquetaOrden
