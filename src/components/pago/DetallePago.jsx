import { CUOTAS, DATOS_TRANSFERENCIA, esTarjeta } from '../../utils/pagos'
import DatosTransferencia from './DatosTransferencia'
import FormTarjeta from './FormTarjeta'
import PagoBilletera from './PagoBilletera'

function DetallePago({ medio, tarjeta, errores, total, onCambiarTarjeta }) {
  if (esTarjeta(medio)) {
    return (
      <FormTarjeta
        tarjeta={tarjeta}
        errores={errores}
        credito={medio === 'TARJETA_CREDITO'}
        cuotas={CUOTAS}
        total={total}
        onCambiar={onCambiarTarjeta}
      />
    )
  }

  if (medio === 'TRANSFERENCIA') {
    return <DatosTransferencia datos={DATOS_TRANSFERENCIA} total={total} />
  }

  return <PagoBilletera total={total} />
}

export default DetallePago
