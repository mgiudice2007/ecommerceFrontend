import { precio } from '../../utils/formato'
import { textoMedioPago } from '../../utils/pagos'
import Etiqueta from '../comunes/Etiqueta'
import './PagoAprobado.css'

function PagoAprobado({ orden }) {
  const medio = textoMedioPago(orden)

  return (
    <header className="pago-aprobado">
      <span className="pago-aprobado-icono" aria-hidden="true">
        ✓
      </span>
      <Etiqueta tipo="exito">Compra #{orden.id}</Etiqueta>
      <h1>¡Pago aprobado!</h1>
      <p className="texto-suave">
        {orden.total > 0 ? `Pagaste ${precio(orden.total)}` : 'Pagaste con tus millas'}
        {medio && orden.total > 0 ? ` con ${medio.toLowerCase()}` : ''}. Tus asientos quedaron reservados y podés ver
        esta compra cuando quieras en Mis compras.
      </p>
    </header>
  )
}

export default PagoAprobado
