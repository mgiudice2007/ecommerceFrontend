import { precio } from '../../utils/formato'
import FilaResumen from '../comunes/FilaResumen'

function DatosTransferencia({ datos, total }) {
  return (
    <div>
      <p className="texto-suave">
        Transferí <strong>{precio(total)}</strong> a esta cuenta y confirmá la compra.
      </p>
      <FilaResumen rotulo="Titular" valor={datos.titular} />
      <FilaResumen rotulo="Alias" valor={datos.alias} />
      <FilaResumen rotulo="CBU" valor={datos.cbu} />
      <FilaResumen rotulo="CUIT" valor={datos.cuit} />
    </div>
  )
}

export default DatosTransferencia
