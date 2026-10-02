import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ItemCarrito from '../components/ItemCarrito'
import { useAuth } from '../context/AuthContext'
import { precio } from '../utils/formato'
import './Carrito.css'

function Carrito() {
  const { actualizarCarrito } = useAuth()
  const [carrito, setCarrito] = useState(null)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    api('/api/carrito')
      .then(setCarrito)
      .catch((err) => setError(err.message))
  }, [])

  // Todas las operaciones del carrito devuelven el carrito actualizado,
  // asi que despues de cada una reemplazamos el estado con lo que vuelve.
  const ejecutar = async (pedido) => {
    setOcupado(true)
    setError('')
    try {
      const actualizado = await pedido()
      setCarrito(actualizado)
      actualizarCarrito(actualizado)
    } catch (err) {
      setError(err.message)
    } finally {
      setOcupado(false)
    }
  }

  const cambiarCantidad = (item, cantidad) =>
    ejecutar(() => api(`/api/carrito/items/${item.id}`, { method: 'PUT', body: { cantidad } }))

  const eliminar = (item) => ejecutar(() => api(`/api/carrito/items/${item.id}`, { method: 'DELETE' }))

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {error ? <div className="mensaje mensaje-error">{error}</div> : <p className="texto-suave">Cargando carrito…</p>}
      </div>
    )
  }

  const cantidadPasajes = carrito.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <>
      <EncabezadoPagina
        titulo="Mi carrito"
        subtitulo={
          cantidadPasajes === 0
            ? 'Todavía no agregaste pasajes.'
            : `${cantidadPasajes} ${cantidadPasajes === 1 ? 'pasaje listo' : 'pasajes listos'} para comprar.`
        }
      />

      <div className="contenedor sobre-encabezado">
        {error && <div className="mensaje mensaje-error">{error}</div>}

        {carrito.items.length === 0 ? (
          <div className="tarjeta carrito-vacio">
            <h2>Tu carrito está vacío</h2>
            <p className="texto-suave">Buscá un vuelo, elegí la clase y agregalo para comprarlo.</p>
            <Link to="/vuelos" className="boton boton-primario">
              Buscar vuelos
            </Link>
          </div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-items">
              {carrito.items.map((item) => (
                <ItemCarrito
                  key={item.id}
                  item={item}
                  onCambiarCantidad={cambiarCantidad}
                  onEliminar={eliminar}
                  ocupado={ocupado}
                />
              ))}
            </div>

            <aside className="tarjeta carrito-resumen">
              <h2>Resumen de compra</h2>
              {carrito.items.map((item) => (
                <div key={item.id} className="carrito-resumen-fila">
                  <span>
                    {item.origen} → {item.destino} × {item.cantidad}
                  </span>
                  <span>{precio(item.subtotal)}</span>
                </div>
              ))}
              <div className="carrito-resumen-total">
                <span>Total a pagar</span>
                <strong>{precio(carrito.total)}</strong>
              </div>
              <p className="texto-suave carrito-aclaracion">
                Los precios ya incluyen los descuentos vigentes. Se confirman al momento de pagar.
              </p>
              <Link to="/checkout" className="boton boton-primario boton-ancho">
                Continuar al pago →
              </Link>
              <Link to="/vuelos" className="carrito-seguir">
                Seguir buscando vuelos
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

export default Carrito
