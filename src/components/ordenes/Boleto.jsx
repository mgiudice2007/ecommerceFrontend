import { fechaLarga, hora, precioOGratis } from '../../utils/formato'
import { nombreTipo } from '../../utils/pasajeros'
import { numerosDeVuelo, rotuloVuelos, textoQr } from '../../utils/ordenes'
import { textoMedioPago } from '../../utils/pagos'
import CodigoQr from './CodigoQr'
import EtiquetaOrden from './EtiquetaOrden'
import TotalesOrden from './TotalesOrden'
import './Boleto.css'

function Boleto({ orden }) {
  const cancelada = orden.estado === 'CANCELADA'

  return (
    <section className="tarjeta orden-boleto">
      <div className="orden-boleto-encabezado">
        <div>
          <small>Número de compra</small>
          <strong>#{orden.id}</strong>
        </div>
        <div>
          <small>{rotuloVuelos(orden)}</small>
          <strong>{numerosDeVuelo(orden).join(' · ')}</strong>
        </div>
        <div>
          <small>Fecha</small>
          <strong>
            {fechaLarga(orden.fecha)} · {hora(orden.fecha)} hs
          </strong>
        </div>
        {orden.medioPago && (
          <div>
            <small>Medio de pago</small>
            <strong>{textoMedioPago(orden)}</strong>
          </div>
        )}
        <EtiquetaOrden cancelada={cancelada} />
      </div>

      <ul className="orden-items">
        {orden.items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>
                {item.origen} → {item.destino}
              </strong>
              <small>
                Vuelo {item.numeroVuelo} · {item.claseNombre} · {item.cantidad} ×{' '}
                {nombreTipo(item.tipoPasajero).toLowerCase()} × {precioOGratis(item.precioUnitario)}
              </small>
              {item.asientos?.length > 0 && (
                <small>
                  {item.asientos.length === 1 ? 'Asiento' : 'Asientos'}: <strong>{item.asientos.join(', ')}</strong>
                </small>
              )}
            </div>
            <span>{precioOGratis(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {!cancelada && (
        <CodigoQr
          valor={textoQr(orden)}
          rotulo={`Código de la compra #${orden.id}`}
          ayuda="Escaneándolo se ve el número de compra, los vuelos y los asientos. Mostralo al embarcar."
        />
      )}

      <TotalesOrden orden={orden} cancelada={cancelada} />
    </section>
  )
}

export default Boleto
