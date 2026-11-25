import { fechaLarga, hora } from '../../utils/formato'
import Etiqueta from '../comunes/Etiqueta'
import './ResultadoEmbarque.css'

const ESTADOS = {
  VALIDO: { tipo: 'exito', texto: 'Pase válido' },
  EMBARCADO: { tipo: 'aviso', texto: 'Ya embarcó' },
  ANULADO: { tipo: 'cancelada', texto: 'Pase anulado' },
}

// El pase que se encontró: sus datos, si es válido y el botón para marcarlo como embarcado
function ResultadoEmbarque({ pase, embarcando, onEmbarcar }) {
  const estado = ESTADOS[pase.estado]

  return (
    <section className={`tarjeta resultado-embarque resultado-${pase.estado.toLowerCase()}`}>
      <header>
        <h2>
          {pase.nombre} {pase.apellido}
        </h2>
        <Etiqueta tipo={estado.tipo}>{estado.texto}</Etiqueta>
      </header>
      {pase.motivo && <p className="resultado-motivo">{pase.motivo}</p>}

      <dl>
        <div>
          <dt>Código</dt>
          <dd>{pase.codigoEmbarque}</dd>
        </div>
        <div>
          <dt>Documento</dt>
          <dd>{pase.documento}</dd>
        </div>
        <div>
          <dt>Vuelo</dt>
          <dd>
            {pase.numeroVuelo} · {pase.origen} → {pase.destino}
          </dd>
        </div>
        <div>
          <dt>Salida</dt>
          <dd>
            {fechaLarga(pase.fechaSalida)} · {hora(pase.fechaSalida)} hs
          </dd>
        </div>
        <div>
          <dt>Clase y asiento</dt>
          <dd>
            {pase.claseNombre} · {pase.asiento ?? 'sin asiento (viaja en brazos)'}
          </dd>
        </div>
        <div>
          <dt>Compra</dt>
          <dd>#{pase.ordenId}</dd>
        </div>
      </dl>

      {pase.estado === 'VALIDO' && (
        <button className="boton boton-primario" onClick={onEmbarcar} disabled={embarcando}>
          {embarcando ? 'Marcando…' : 'Marcar como embarcado'}
        </button>
      )}
    </section>
  )
}

export default ResultadoEmbarque
