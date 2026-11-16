import { textoEstado } from '../../utils/vuelos'
import Etiqueta from './Etiqueta'

function EtiquetaEstado({ estado }) {
  return <Etiqueta className={`estado-${estado.toLowerCase()}`}>{textoEstado(estado)}</Etiqueta>
}

export default EtiquetaEstado
