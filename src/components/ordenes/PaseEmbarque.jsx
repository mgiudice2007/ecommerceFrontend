import { fechaLarga, hora } from '../../utils/formato'
import { nombreTipo } from '../../utils/pasajeros'
import Etiqueta from '../comunes/Etiqueta'
import CodigoQr from './CodigoQr'
import './PaseEmbarque.css'

// El pase de una persona en un vuelo. Si la compra está cancelada deja de ser válido y no muestra el QR.
function PaseEmbarque({ pasaje, item, anulado }) {
  return (
    <article className={`pase-embarque ${anulado ? 'pase-anulado' : ''}`.trim()}>
      <div className="pase-datos">
        <small>Pase de embarque</small>
        <strong className="pase-nombre">
          {pasaje.nombre} {pasaje.apellido}
        </strong>
        <span>
          {item.origen} → {item.destino}
        </span>
        <span className="texto-suave">
          Vuelo {item.numeroVuelo} · {fechaLarga(item.fechaSalida)} · {hora(item.fechaSalida)} hs
        </span>
        <span className="texto-suave">
          Clase {item.claseNombre} · {nombreTipo(item.tipoPasajero)} ·{' '}
          {pasaje.asiento ? `Asiento ${pasaje.asiento}` : 'Viaja en brazos, sin asiento'}
        </span>
        <span className="texto-suave">
          {pasaje.tipoDocumento === 'PASAPORTE' ? 'Pasaporte' : 'DNI'} {pasaje.documento}
        </span>
        <code className="pase-codigo">{pasaje.codigoEmbarque}</code>
      </div>

      <div className="pase-qr">
        {anulado ? (
          <Etiqueta tipo="cancelada">Anulado</Etiqueta>
        ) : (
          <>
            <CodigoQr valor={pasaje.codigoEmbarque} titulo={`QR del pase ${pasaje.codigoEmbarque}`} />
            {pasaje.embarcadoEn && <Etiqueta tipo="exito">Embarcado</Etiqueta>}
          </>
        )}
      </div>
    </article>
  )
}

export default PaseEmbarque
