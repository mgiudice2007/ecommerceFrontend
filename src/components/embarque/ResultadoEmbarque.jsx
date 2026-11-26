import { fechaLarga, hora } from '../../utils/formato'
import './ResultadoEmbarque.css'

// Lo que muestra el semaforo segun el estado del pase
const ESTADOS = {
  VALIDO: { clase: 'valido', icono: '✓', texto: 'Puede embarcar' },
  OK: { clase: 'ok', icono: '✓', texto: 'Embarque OK' },
  EMBARCADO: { clase: 'embarcado', icono: '!', texto: 'Ya embarcó' },
  ANULADO: { clase: 'anulado', icono: '✕', texto: 'Pase anulado' },
}

// El pase que se encontró: sus datos, si es válido y el botón para marcarlo como embarcado
function ResultadoEmbarque({ pase, embarcando, recienEmbarcado, onEmbarcar }) {
  // Si se acaba de embarcar en esta pantalla, se muestra en verde "Embarque OK"
  const estado = ESTADOS[recienEmbarcado && pase.estado === 'EMBARCADO' ? 'OK' : pase.estado]

  return (
    <section className={`tarjeta resultado-embarque semaforo-${estado.clase}`} key={estado.clase}>
      <header className="resultado-semaforo">
        <span className="resultado-luz" aria-hidden="true">
          {estado.icono}
        </span>
        <div>
          <strong>{estado.texto}</strong>
          <span>
            {pase.nombre} {pase.apellido} · {pase.asiento ?? 'sin asiento'} · {pase.numeroVuelo}
          </span>
          {pase.motivo && estado.clase !== 'ok' && <small>Motivo: {pase.motivo}</small>}
        </div>
      </header>

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
