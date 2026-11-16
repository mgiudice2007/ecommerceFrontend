import { Link } from 'react-router-dom'
import { millas, precio, precioOGratis } from '../../utils/formato'
import { nombreTipo } from '../../utils/pasajeros'
import FilaResumen from '../comunes/FilaResumen'
import FilaTotal from '../comunes/FilaTotal'
import Mensaje from '../comunes/Mensaje'
import './ResumenCompra.css'

function ResumenCompra({ items, calculo, selectorMillas, sinAdulto, comprando, bloqueado, onConfirmar }) {
  return (
    <aside className="tarjeta carrito-resumen">
      <h2>Resumen de compra</h2>
      {items.map((item) => (
        <FilaResumen
          key={item.id}
          rotulo={`${item.origen} → ${item.destino} · ${item.cantidad} × ${nombreTipo(item.tipoPasajero).toLowerCase()}`}
          valor={precioOGratis(item.subtotal)}
        />
      ))}

      {selectorMillas}

      {calculo.aUsar > 0 && (
        <FilaResumen ahorro rotulo={`Pagás con ${millas(calculo.aUsar)} millas`} valor={`− ${precio(calculo.descuento)}`} />
      )}

      <FilaTotal className="carrito-resumen-total" rotulo="Total a pagar" valor={precio(calculo.aPagar)} />
      <p className="carrito-millas-gana">✈ Con esta compra sumás {millas(calculo.queSuma)} millas</p>
      <p className="texto-suave carrito-aclaracion">
        Los precios ya incluyen los descuentos vigentes. Al confirmar, tus asientos quedan reservados.
      </p>

      {sinAdulto.length > 0 && (
        <Mensaje>
          Tiene que viajar al menos un adulto en {sinAdulto.length === 1 ? 'el vuelo' : 'los vuelos'}{' '}
          {sinAdulto.join(', ')}. Agregá un adulto o sacá a los menores del carrito.
        </Mensaje>
      )}

      <button className="boton boton-primario boton-ancho" onClick={onConfirmar} disabled={comprando || bloqueado}>
        {comprando ? 'Confirmando…' : `Confirmar compra · ${precio(calculo.aPagar)}`}
      </button>
      <Link to="/" className="carrito-seguir">
        Seguir buscando vuelos
      </Link>
    </aside>
  )
}

export default ResumenCompra
