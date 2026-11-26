// El estado de la compra es un sello: verde si esta confirmada, azul si ya se volo,
// rojo si se cancelo
const SELLOS = {
  proxima: { clase: 'sello-exito', texto: 'Confirmada' },
  realizada: { clase: 'sello-volado', texto: 'Volado' },
  cancelada: { clase: 'sello-cancelada', texto: 'Cancelada' },
}

function EtiquetaOrden({ cancelada, momento }) {
  const sello = SELLOS[momento ?? (cancelada ? 'cancelada' : 'proxima')]
  return <span className={`sello ${sello.clase}`}>{sello.texto}</span>
}

export default EtiquetaOrden
