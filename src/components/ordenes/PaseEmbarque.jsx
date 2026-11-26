import { useSelector } from 'react-redux'
import { hora } from '../../utils/formato'
import { nombreTipo } from '../../utils/pasajeros'
import CodigoQr from './CodigoQr'
import './PaseEmbarque.css'

// Datos que el backend no guarda: se calculan a partir del vuelo para que el pase se vea
// completo, y siempre dan lo mismo para el mismo vuelo
const puertaDe = (vueloId) => `${'ABC'[vueloId % 3]}${10 + ((vueloId * 7) % 30)}`
const horaEmbarque = (fechaSalida) => new Date(new Date(fechaSalida).getTime() - 40 * 60000)
const zonaDe = (claseNombre = '') => {
  const clase = claseNombre.toLowerCase()
  if (clase.includes('primera')) return 1
  if (clase.includes('ejecutiva')) return 2
  return 3
}
const fechaPase = (fecha) =>
  new Date(fecha)
    .toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/de /g, '')
    .replace('.', '')
    .toUpperCase()

function Dato({ rotulo, children, clase = '' }) {
  return (
    <div className={`pase-dato ${clase}`.trim()}>
      <small>{rotulo}</small>
      <strong>{children}</strong>
    </div>
  )
}

// La tarjeta de embarque de una persona en un vuelo. El QR es el codigo de embarque real
// (el que escanea el admin en Validar embarque). Si la compra esta cancelada, el pase queda
// anulado: no muestra el QR y le cae un sello.
function PaseEmbarque({ pasaje, item, anulado }) {
  const { aeropuertos } = useSelector((state) => state.catalogo)
  const iataDe = (ciudad) => aeropuertos.find((a) => a.ciudad === ciudad)?.codigoIata
  const origenIata = iataDe(item.origen)
  const destinoIata = iataDe(item.destino)
  const asiento = pasaje.asiento ?? '—'
  const documento = `${pasaje.tipoDocumento === 'PASAPORTE' ? 'Pasaporte' : 'DNI'} ${pasaje.documento}`

  return (
    <div className="pase-sombra">
      <article
        className={`pase ${anulado ? 'pase-anulado' : ''}`.trim()}
        aria-label={`Tarjeta de embarque de ${pasaje.nombre} ${pasaje.apellido}, vuelo ${item.numeroVuelo}`}
      >
        <div className="pase-principal">
          <header className="pase-encabezado">
            <span className="pase-marca">
              <span className="pase-marca-icono" aria-hidden="true">
                ✈
              </span>
              <span>
                <strong>BCA Airlines</strong>
                <small>República Argentina</small>
              </span>
            </span>
            <span className="pase-titulo">Tarjeta de embarque</span>
          </header>

          <div className="pase-datos">
            <Dato rotulo="Pasajero" clase="pase-dato-pasajero">
              {pasaje.nombre} {pasaje.apellido}
            </Dato>
            <Dato rotulo="Vuelo">{item.numeroVuelo}</Dato>
            <Dato rotulo="Fecha">{fechaPase(item.fechaSalida)}</Dato>
            <Dato rotulo="Asiento" clase="pase-dato-destacado">
              {asiento}
            </Dato>

            <Dato rotulo="Desde" clase="pase-dato-ancho">
              {item.origen}
              {origenIata && ` (${origenIata})`}
            </Dato>
            <Dato rotulo="Hacia" clase="pase-dato-ancho">
              {item.destino}
              {destinoIata && ` (${destinoIata})`}
            </Dato>

            <Dato rotulo="Puerta">{puertaDe(item.vueloId)}</Dato>
            <Dato rotulo="Embarque" clase="pase-dato-grande">
              {hora(horaEmbarque(item.fechaSalida))}
            </Dato>
            <Dato rotulo="Salida" clase="pase-dato-grande">
              {hora(item.fechaSalida)}
            </Dato>
            <Dato rotulo="Zona">{zonaDe(item.claseNombre)}</Dato>
          </div>

          <footer className="pase-pie">
            <span>
              {documento} · {nombreTipo(item.tipoPasajero)}
            </span>
            <span>Código {pasaje.codigoEmbarque}</span>
          </footer>
        </div>

        <aside className="pase-talon">
          <span className="pase-talon-clase">Clase {item.claseNombre}</span>
          {anulado ? (
            <span className="pase-talon-anulado">Sin QR</span>
          ) : (
            <CodigoQr valor={pasaje.codigoEmbarque} titulo={`QR del pase ${pasaje.codigoEmbarque}`} lado={104} />
          )}
          <div className="pase-talon-asiento">
            <strong>{asiento}</strong>
            <small>{pasaje.asiento ? 'Asiento' : 'Viaja en brazos'}</small>
          </div>
          <span className="pase-barras" aria-hidden="true" />
        </aside>

        {anulado && <span className="pase-sello sello sello-cancelada">Anulado</span>}
        {!anulado && pasaje.embarcadoEn && <span className="pase-sello sello sello-exito">Embarcado</span>}
      </article>
    </div>
  )
}

export default PaseEmbarque
