import Mensaje from '../comunes/Mensaje'
import './PanelCompra.css'

function PanelCompra({ motivoSinVenta, hayClase, children }) {
  return (
    <aside className="tarjeta detalle-compra">
      <h2>Tu selección</h2>

      {motivoSinVenta ? (
        <Mensaje>{motivoSinVenta}</Mensaje>
      ) : !hayClase ? (
        <p className="texto-suave">Elegí una clase para continuar.</p>
      ) : (
        children
      )}
    </aside>
  )
}

export default PanelCompra
