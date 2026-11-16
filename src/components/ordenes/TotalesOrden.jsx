import { millas, precio } from '../../utils/formato'
import FilaResumen from '../comunes/FilaResumen'
import FilaTotal from '../comunes/FilaTotal'
import './TotalesOrden.css'

function TotalesOrden({ orden, cancelada }) {
  return (
    <div className="orden-totales">
      <FilaResumen rotulo="Pasajes" valor={precio(orden.total + orden.descuentoMillas)} />
      {orden.millasUsadas > 0 && (
        <FilaResumen
          ahorro
          rotulo={`Pagaste con ${millas(orden.millasUsadas)} millas`}
          valor={`− ${precio(orden.descuentoMillas)}`}
        />
      )}
      <FilaTotal rotulo="Total abonado" valor={precio(orden.total)} />
      {orden.descuentoTotal > 0 && (
        <p className="orden-nota-descuento">
          🏷 Ahorraste {precio(orden.descuentoTotal)} con la promoción del vuelo (ya está descontado en el precio de
          cada pasaje).
        </p>
      )}
      {orden.millasGanadas > 0 && (
        <p className="orden-millas">
          {cancelada
            ? `Al cancelar se descontaron las ${millas(orden.millasGanadas)} millas que habías sumado.`
            : `✈ Sumaste ${millas(orden.millasGanadas)} millas con esta compra.`}
        </p>
      )}
    </div>
  )
}

export default TotalesOrden
