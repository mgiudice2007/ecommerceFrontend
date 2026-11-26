import Mensaje from '../comunes/Mensaje'
import './PanelCompra.css'

function PanelCompra({ motivoSinVenta, hayClase, children }) {
  return (
    <div className="detalle-compra-pase">
      <aside className="tarjeta detalle-compra">
        <div className="detalle-compra-cabecera">
          <span>BCA Airlines · Tu pasaje</span>
          <h2>Tu selección</h2>
        </div>

        {motivoSinVenta ? (
          <Mensaje>{motivoSinVenta}</Mensaje>
        ) : !hayClase ? (
          <p className="texto-suave">Elegí una clase para continuar.</p>
        ) : (
          children
        )}

        <span className="detalle-compra-barras" aria-hidden="true" />
      </aside>
    </div>
  )
}

export default PanelCompra
