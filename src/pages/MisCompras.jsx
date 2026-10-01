import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import { fechaLarga, hora, precio } from '../utils/formato'
import { cancelarOrden } from '../utils/ordenes'
import './MisCompras.css'

function MisCompras() {
  const [ordenes, setOrdenes] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cancelando, setCancelando] = useState(null) // id de la orden que se esta cancelando

  useEffect(() => {
    api('/api/ordenes')
      .then(setOrdenes)
      .catch((err) => setError(err.message))
  }, [])

  const cancelar = async (orden) => {
    setError('')
    setMensaje('')
    setCancelando(orden.id)
    try {
      const actualizada = await cancelarOrden(orden)
      if (actualizada) {
        // Reemplazamos solo la orden que cambio, el resto queda igual
        setOrdenes(ordenes.map((o) => (o.id === actualizada.id ? actualizada : o)))
        setMensaje(`Cancelaste la compra #${actualizada.id}. Los asientos volvieron a estar disponibles.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelando(null)
    }
  }

  return (
    <div className="contenedor pagina">
      <h1 className="compras-titulo">Mis compras</h1>

      {error && <div className="mensaje mensaje-error">{error}</div>}
      {mensaje && <div className="mensaje mensaje-exito">{mensaje}</div>}

      {!ordenes && !error && <p className="texto-suave">Cargando compras…</p>}

      {ordenes?.length === 0 && (
        <div className="tarjeta compras-vacio">
          <h2>Todavía no compraste pasajes</h2>
          <p className="texto-suave">Cuando confirmes una compra, la vas a ver acá.</p>
          <Link to="/vuelos" className="boton boton-primario">
            Buscar vuelos
          </Link>
        </div>
      )}

      <div className="compras-lista">
        {ordenes?.map((orden) => {
          const cancelada = orden.estado === 'CANCELADA'
          const pasajes = orden.items.reduce((total, item) => total + item.cantidad, 0)

          return (
            <article key={orden.id} className={`tarjeta compra ${cancelada ? 'compra-cancelada' : ''}`}>
              <div className="compra-encabezado">
                <div>
                  <strong>Compra #{orden.id}</strong>
                  <small>
                    {fechaLarga(orden.fecha)} · {hora(orden.fecha)} hs · {pasajes}{' '}
                    {pasajes === 1 ? 'pasaje' : 'pasajes'}
                  </small>
                </div>
                <span className={`etiqueta ${cancelada ? 'etiqueta-cancelada' : 'etiqueta-exito'}`}>
                  {cancelada ? 'Cancelada' : 'Confirmada'}
                </span>
              </div>

              <ul className="compra-vuelos">
                {orden.items.map((item) => (
                  <li key={item.id}>
                    {item.origen} → {item.destino}
                    <small>
                      {' '}
                      · Vuelo {item.numeroVuelo} · {item.claseNombre} × {item.cantidad}
                    </small>
                  </li>
                ))}
              </ul>

              <div className="compra-pie">
                <strong>{precio(orden.total)}</strong>
                <div className="compra-acciones">
                  {!cancelada && (
                    <button
                      className="boton boton-peligro"
                      onClick={() => cancelar(orden)}
                      disabled={cancelando === orden.id}
                    >
                      {cancelando === orden.id ? 'Cancelando…' : 'Cancelar compra'}
                    </button>
                  )}
                  <Link to={`/mis-compras/${orden.id}`} className="boton boton-secundario">
                    Ver detalle
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default MisCompras
