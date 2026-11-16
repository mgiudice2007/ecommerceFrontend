import Etiqueta from '../comunes/Etiqueta'

function EtiquetaOrden({ cancelada }) {
  return <Etiqueta tipo={cancelada ? 'cancelada' : 'exito'}>{cancelada ? 'Cancelada' : 'Confirmada'}</Etiqueta>
}

export default EtiquetaOrden
