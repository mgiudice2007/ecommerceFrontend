import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import { useAuth } from '../context/AuthContext'
import { precio } from '../utils/formato'
import './Carrito.css'
import './Checkout.css'

// El pago es SIMULADO: el backend no procesa pagos. Elegir el medio es solo
// visual; al confirmar se llama a POST /api/carrito/checkout, que descuenta
// los asientos, crea la orden con los precios congelados y vacia el carrito.
const MEDIOS_DE_PAGO = [
  { valor: 'tarjeta', titulo: 'Tarjeta de crédito o débito', detalle: 'Visa, Mastercard, American Express' },
  { valor: 'mercadopago', titulo: 'Mercado Pago', detalle: 'Dinero en cuenta o tarjetas guardadas' },
  { valor: 'transferencia', titulo: 'Transferencia bancaria', detalle: 'CBU / CVU / alias' },
]

function Checkout() {
  const { actualizarCarrito } = useAuth()
  const navigate = useNavigate()

  const [carrito, setCarrito] = useState(null)
  const [medio, setMedio] = useState('tarjeta')
  const [error, setError] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    api('/api/carrito')
      .then(setCarrito)
      .catch((err) => setError(err.message))
  }, [])

  const confirmarCompra = async () => {
    setConfirmando(true)
    setError('')
    try {
      const orden = await api('/api/carrito/checkout', { method: 'POST' })
      actualizarCarrito({ items: [] }) // el backend ya vacio el carrito
      navigate(`/mis-compras/${orden.id}`, { replace: true, state: { recienComprada: true } })
    } catch (err) {
      // Por ejemplo: alguien compro los ultimos asientos mientras tanto
      setError(err.message)
      setConfirmando(false)
    }
  }

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {error ? <div className="mensaje mensaje-error">{error}</div> : <p className="texto-suave">Cargando…</p>}
      </div>
    )
  }

  if (carrito.items.length === 0) {
    return (
      <div className="contenedor pagina">
        <div className="tarjeta carrito-vacio">
          <h2>No hay nada para pagar</h2>
          <p className="texto-suave">Tu carrito está vacío.</p>
          <Link to="/vuelos" className="boton boton-primario">
            Buscar vuelos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor pagina">
      <nav className="checkout-pasos" aria-label="Pasos de la compra">
        <span className="hecho">1. Carrito</span>
        <span className="actual">2. Pago</span>
        <span>3. Confirmación</span>
      </nav>

      <div className="carrito-layout">
        <section className="tarjeta">
          <h1 className="checkout-titulo">Seleccioná cómo pagar</h1>

          <div className="checkout-medios" role="radiogroup" aria-label="Medio de pago">
            {MEDIOS_DE_PAGO.map((m) => (
              <label key={m.valor} className={`checkout-medio ${medio === m.valor ? 'seleccionado' : ''}`}>
                <input
                  type="radio"
                  name="medio"
                  value={m.valor}
                  checked={medio === m.valor}
                  onChange={(e) => setMedio(e.target.value)}
                />
                <span>
                  <strong>{m.titulo}</strong>
                  <small>{m.detalle}</small>
                </span>
              </label>
            ))}
          </div>

          <div className="checkout-aviso">
            <strong>Pago simulado</strong>
            <p>
              Este sitio es un trabajo práctico: no se cobra nada ni se piden datos de tarjeta. Al confirmar se
              registra la compra y se reservan los asientos.
            </p>
          </div>
        </section>

        <aside className="tarjeta carrito-resumen">
          <h2>Detalle de la compra</h2>
          {carrito.items.map((item) => (
            <div key={item.id} className="carrito-resumen-fila">
              <span>
                {item.origen} → {item.destino}
                <br />
                <small>
                  {item.claseNombre} × {item.cantidad}
                </small>
              </span>
              <span>{precio(item.subtotal)}</span>
            </div>
          ))}

          <div className="carrito-resumen-total">
            <span>Total</span>
            <strong>{precio(carrito.total)}</strong>
          </div>

          {error && <div className="mensaje mensaje-error checkout-error">{error}</div>}

          <button
            className="boton boton-primario boton-ancho checkout-confirmar"
            onClick={confirmarCompra}
            disabled={confirmando}
          >
            {confirmando ? 'Confirmando…' : `Confirmar compra · ${precio(carrito.total)}`}
          </button>
          <Link to="/carrito" className="carrito-seguir">
            ← Volver al carrito
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default Checkout
