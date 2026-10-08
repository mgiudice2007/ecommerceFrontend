import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ItemCarrito from '../components/ItemCarrito'
import { useAuth } from '../context/AuthContext'
import { millas, precio } from '../utils/formato'
import { nombreTipo } from '../utils/pasajeros'
import './Carrito.css'

function Carrito() {
  const { actualizarCarrito, recargarPerfil } = useAuth()
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState(null)
  const [comprando, setComprando] = useState(false)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [usarMillas, setUsarMillas] = useState(false) // casilla "Usar millas + dinero"
  const [millasElegidas, setMillasElegidas] = useState('')

  useEffect(() => {
    api('/api/carrito')
      .then(setCarrito)
      .catch((err) => setError(err.message))
  }, [])

  // Todas las operaciones del carrito devuelven el carrito actualizado,
  // asi que despues de cada una reemplazamos el estado con lo que vuelve.
  const mostrarCarrito = (actualizado) => {
    setCarrito(actualizado)
    actualizarCarrito(actualizado)
  }

  const cambiarCantidad = (item, cantidad) => {
    setOcupado(true)
    setError('')
    api(`/api/carrito/items/${item.id}`, { method: 'PUT', body: { cantidad } })
      .then(mostrarCarrito)
      .catch((err) => setError(err.message))
      .finally(() => setOcupado(false))
  }

  const eliminar = (item) => {
    setOcupado(true)
    setError('')
    api(`/api/carrito/items/${item.id}`, { method: 'DELETE' })
      .then(mostrarCarrito)
      .catch((err) => setError(err.message))
      .finally(() => setOcupado(false))
  }

  // La compra no pide datos de pago: POST /api/carrito/checkout valida el stock,
  // descuenta los asientos, crea la orden y vacia el carrito. Despues se muestra
  // la pantalla de "Compra confirmada".
  const confirmarCompra = () => {
    setComprando(true)
    setError('')
    // Si eligio usar millas, se mandan en el body; si no, se paga todo con plata
    const opciones = usarMillas ? { method: 'POST', body: { millas: millasAUsar } } : { method: 'POST' }
    api('/api/carrito/checkout', opciones)
      .then((orden) => {
        actualizarCarrito({ items: [] })
        recargarPerfil() // el saldo de millas cambio
        navigate(`/mis-compras/${orden.id}`, { replace: true, state: { recienComprada: true } })
      })
      .catch((err) => {
        // Por ejemplo: alguien compro los ultimos asientos mientras tanto
        setError(err.message)
        setComprando(false)
      })
  }

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {error ? <div className="mensaje mensaje-error">{error}</div> : <p className="texto-suave">Cargando carrito…</p>}
      </div>
    )
  }

  const cantidadPasajes = carrito.items.reduce((total, item) => total + item.cantidad, 0)

  // Millas: no se pueden usar mas de las que tiene ni pagar mas que el total
  const maximoMillas = Math.min(carrito.millasDisponibles, Math.floor(carrito.total / carrito.valorMilla))
  const millasAUsar = usarMillas ? Math.min(Number(millasElegidas) || 0, maximoMillas) : 0
  const descuentoMillas = millasAUsar * carrito.valorMilla
  const aPagar = carrito.total - descuentoMillas
  // Lo pagado con millas no suma millas (el backend hace la misma cuenta)
  const millasQueSuma = carrito.total > 0 ? Math.floor((carrito.millasAGanar * aPagar) / carrito.total) : 0

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
                    {item.origen} → {item.destino} · {item.cantidad} × {nombreTipo(item.tipoPasajero).toLowerCase()}
                  </span>
                  <span>{precio(item.subtotal)}</span>
                </div>
              ))}

              {/* Como en LATAM: se puede pagar una parte con millas y el resto con plata */}
              <div className="carrito-millas">
                <label className="carrito-millas-casilla">
                  <input
                    type="checkbox"
                    checked={usarMillas}
                    disabled={carrito.millasDisponibles === 0}
                    onChange={(e) => {
                      setUsarMillas(e.target.checked)
                      setMillasElegidas(String(maximoMillas))
                    }}
                  />
                  <span>
                    Usar <strong>millas + dinero</strong>
                    <small>Tenés {millas(carrito.millasDisponibles)} millas · cada milla vale {precio(carrito.valorMilla)}</small>
                  </span>
                </label>

                {usarMillas && (
                  <div className="campo">
                    <label htmlFor="millas">Millas a usar (máximo {millas(maximoMillas)})</label>
                    <input
                      id="millas"
                      type="number"
                      min="0"
                      max={maximoMillas}
                      value={millasElegidas}
                      onChange={(e) => setMillasElegidas(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {millasAUsar > 0 && (
                <div className="carrito-resumen-fila carrito-resumen-ahorro">
                  <span>Pagás con {millas(millasAUsar)} millas</span>
                  <span>− {precio(descuentoMillas)}</span>
                </div>
              )}

              <div className="carrito-resumen-total">
                <span>Total a pagar</span>
                <strong>{precio(aPagar)}</strong>
              </div>
              <p className="carrito-millas-gana">✈ Con esta compra sumás {millas(millasQueSuma)} millas</p>
              <p className="texto-suave carrito-aclaracion">
                Los precios ya incluyen los descuentos vigentes. Al confirmar, tus asientos quedan reservados.
              </p>
              <button
                className="boton boton-primario boton-ancho"
                onClick={confirmarCompra}
                disabled={comprando || ocupado}
              >
                {comprando ? 'Confirmando…' : `Confirmar compra · ${precio(aPagar)}`}
              </button>
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
