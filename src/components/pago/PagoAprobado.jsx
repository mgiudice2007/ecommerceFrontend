import { precio } from '../../utils/formato'
import { textoMedioPago } from '../../utils/pagos'
import './PagoAprobado.css'

function PagoAprobado({ orden }) {
  const medio = textoMedioPago(orden)

  return (
    <header className="pago-aprobado">
      <div className="pago-aprobado-pista" aria-hidden="true">
        <span className="pago-aprobado-avion">✈</span>
      </div>
      <span className="sello sello-exito">Compra #{orden.id} · Confirmada</span>
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
