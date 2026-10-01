import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../api/api'
import { fechaLarga, hora, precio } from '../utils/formato'
import { cancelarOrden } from '../utils/ordenes'
import './DetalleOrden.css'

// Detalle de una compra (GET /api/ordenes/:id).
// Si venimos recien del checkout, muestra el encabezado de "Compra confirmada".
function DetalleOrden() {
  const { id } = useParams()
  const location = useLocation()
  const recienComprada = location.state?.recienComprada === true

  const [orden, setOrden] = useState(null)
  const [error, setError] = useState('')
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    api(`/api/ordenes/${id}`)
      .then(setOrden)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <div className="contenedor pagina">
        <div className="mensaje mensaje-error">{error}</div>
        <Link to="/mis-compras">← Volver a mis compras</Link>
      </div>
    )
  }

  if (!orden) {
    return <div className="contenedor pagina texto-suave">Cargando compra…</div>
  }

  const cancelada = orden.estado === 'CANCELADA'

  const cancelar = async () => {
    setCancelando(true)
    try {
      const actualizada = await cancelarOrden(orden)
      if (actualizada) setOrden(actualizada)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div className="contenedor pagina orden">
      {recienComprada && !cancelada ? (
        <header className="orden-exito">
          <span className="orden-exito-icono" aria-hidden="true">✓</span>
          <span className="etiqueta etiqueta-exito">Compra aprobada</span>
          <h1>¡Compra confirmada!</h1>
          <p className="texto-suave">Tus asientos quedaron reservados. Podés ver esta compra cuando quieras en Mis compras.</p>
        </header>
      ) : (
        <header className="orden-encabezado">
          <Link to="/mis-compras">← Mis compras</Link>
          <h1>Compra #{orden.id}</h1>
        </header>
      )}

      {cancelada && (
        <div className="mensaje mensaje-error">
          Esta compra está cancelada: los asientos se devolvieron al vuelo.
        </div>
      )}

      <section className="tarjeta orden-boleto">
        <div className="orden-boleto-encabezado">
          <div>
            <small>Número de compra</small>
            <strong>#{orden.id}</strong>
          </div>
          <div>
            <small>Fecha</small>
            <strong>
              {fechaLarga(orden.fecha)} · {hora(orden.fecha)} hs
            </strong>
          </div>
          <span className={`etiqueta ${cancelada ? 'etiqueta-cancelada' : 'etiqueta-exito'}`}>
            {cancelada ? 'Cancelada' : 'Confirmada'}
          </span>
        </div>

        <ul className="orden-items">
          {orden.items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>
                  {item.origen} → {item.destino}
                </strong>
                <small>
                  Vuelo {item.numeroVuelo} · {item.claseNombre} · {item.cantidad}{' '}
                  {item.cantidad === 1 ? 'pasaje' : 'pasajes'} × {precio(item.precioUnitario)}
                </small>
              </div>
              <span>{precio(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="orden-totales">
          {orden.descuentoTotal > 0 && (
            <div className="orden-ahorro">
              <span>Ahorraste con descuentos</span>
              <span>− {precio(orden.descuentoTotal)}</span>
            </div>
          )}
          <div className="orden-total">
            <span>Total abonado</span>
            <strong>{precio(orden.total)}</strong>
          </div>
        </div>
      </section>

      <div className="orden-acciones">
        <Link to="/mis-compras" className="boton boton-primario">
          Ver mis compras
        </Link>
        <Link to="/" className="boton boton-secundario">
          Volver al inicio
        </Link>
        {!cancelada && (
          <button className="boton boton-peligro" onClick={cancelar} disabled={cancelando}>
            {cancelando ? 'Cancelando…' : 'Cancelar compra'}
          </button>
        )}
      </div>
    </div>
  )
}

export default DetalleOrden
