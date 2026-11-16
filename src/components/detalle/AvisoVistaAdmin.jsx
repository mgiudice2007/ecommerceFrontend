import { Link } from 'react-router-dom'
import './AvisoVistaAdmin.css'

function AvisoVistaAdmin({ vueloId }) {
  return (
    <div className="detalle-vista-admin">
      <div className="contenedor">
        <span>
          👁 Estás viendo este vuelo <strong>como lo ve un comprador</strong>. Es solo para mirar: como administrador
          no podés comprar.
        </span>
        <Link to={`/panel/vuelos/${vueloId}`} className="boton boton-claro">
          ← Volver a gestionar el vuelo
        </Link>
      </div>
    </div>
  )
}

export default AvisoVistaAdmin
