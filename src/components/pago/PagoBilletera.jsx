import qr from '../../assets/qr-pago.svg'
import { precio } from '../../utils/formato'
import './PagoBilletera.css'

function PagoBilletera({ total }) {
  return (
    <div className="pago-billetera">
      <img src={qr} alt="Código QR de ejemplo" width="180" height="180" />
      <p className="texto-suave">
        Escaneá el código con tu billetera virtual y pagá <strong>{precio(total)}</strong>. Después confirmá la compra.
      </p>
    </div>
  )
}

export default PagoBilletera
