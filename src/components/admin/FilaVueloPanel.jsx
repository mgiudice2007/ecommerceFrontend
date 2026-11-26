import { Link } from 'react-router-dom'
import { fechaCorta, hora, precio } from '../../utils/formato'
import { asientosDe, ESTADOS_VUELO, textoDescuento } from '../../utils/vuelos'
import Etiqueta from '../comunes/Etiqueta'
import EtiquetaEstado from '../comunes/EtiquetaEstado'
import FotoVuelo from '../FotoVuelo'
import './FilaVueloPanel.css'

function FilaVueloPanel({ vuelo, onCambiarEstado, onEliminar }) {
  const asientos = asientosDe(vuelo)
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)
  const sinClases = vuelo.disponibilidades.length === 0

  return (
    <article className={`tarjeta panel-vuelo estado-${vuelo.estado.toLowerCase()}`}>
      <div className="panel-vuelo-foto" aria-hidden="true">
        <FotoVuelo destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
      </div>
      <div className="panel-vuelo-info">
        <div className="panel-vuelo-titulo">
          <strong>
            {vuelo.origenCiudad} → {vuelo.destinoCiudad}
          </strong>
          <span className="texto-suave">
            Vuelo {vuelo.numeroVuelo} · {fechaCorta(vuelo.fechaSalida)} {hora(vuelo.fechaSalida)} hs
          </span>
        </div>
        <div className="panel-vuelo-etiquetas">
          <Etiqueta>{vuelo.categoriaNombre}</Etiqueta>
          {descuento && <Etiqueta tipo="exito">{descuento}</Etiqueta>}
          {sinClases && <Etiqueta tipo="aviso">Sin clases cargadas</Etiqueta>}
          {vuelo.estado !== 'ACTIVO' && <EtiquetaEstado estado={vuelo.estado} />}
        </div>
      </div>

      <div className="panel-vuelo-asientos">
        <small>Vendidos</small>
        <strong>
          {asientos.vendidos} / {asientos.totales}
        </strong>
      </div>

      <div className="panel-vuelo-acciones">
        <select
          className="panel-vuelo-estado"
          value={vuelo.estado}
          onChange={(e) => onCambiarEstado(vuelo, e.target.value)}
          aria-label={`Estado del vuelo ${vuelo.numeroVuelo}`}
        >
          {ESTADOS_VUELO.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.texto}
            </option>
          ))}
        </select>
        <Link to={`/panel/vuelos/${vuelo.id}`} className="boton boton-primario">
          Gestionar
        </Link>
        <button className="boton boton-peligro" onClick={() => onEliminar(vuelo)}>
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default FilaVueloPanel
