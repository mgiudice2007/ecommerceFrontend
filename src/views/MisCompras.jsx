import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import EncabezadoPagina from '../components/EncabezadoPagina'
import FotoVuelo from '../components/FotoVuelo'
import { fechaLarga, hora, precio } from '../utils/formato'
import Confirmacion from '../components/Confirmacion'
import { cancelarOrden, numerosDeVuelo } from '../utils/ordenes'
import { useAuth } from '../context/AuthContext'
import './MisCompras.css'

function MisCompras() {
  const { recargarPerfil } = useAuth() // al cancelar cambian las millas
  const [ordenes, setOrdenes] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cancelando, setCancelando] = useState(null) // id de la orden que se esta cancelando
  const [aCancelar, setACancelar] = useState(null) // orden que espera confirmacion (muestra el cartel)

  useEffect(() => {
    api('/api/ordenes')
      .then(setOrdenes)
      .catch((err) => setError(err.message))
  }, [])

  const cancelar = (orden) => {
    setACancelar(null) // se cierra el cartel
    setError('')
    setMensaje('')
    setCancelando(orden.id)
    cancelarOrden(orden)
      .then((actualizada) => {
        // Reemplazamos solo la orden que cambio, el resto queda igual
        setOrdenes(ordenes.map((o) => (o.id === actualizada.id ? actualizada : o)))
        recargarPerfil()
        setMensaje(`Cancelaste la compra #${actualizada.id}. Los asientos volvieron a estar disponibles.`)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCancelando(null))
  }

  return (
    <>
      <EncabezadoPagina titulo="Mis compras" subtitulo="Revisá tus pasajes y cancelá una compra si cambian tus planes." />

      <div className="contenedor sobre-encabezado">
        {error && <div className="mensaje mensaje-error">{error}</div>}
        {mensaje && <div className="mensaje mensaje-exito">{mensaje}</div>}

        {!ordenes && !error && <p className="texto-suave">Cargando compras…</p>}

        {ordenes?.length === 0 && (
          <div className="tarjeta compras-vacio">
            <h2>Todavía no compraste pasajes</h2>
            <p className="texto-suave">Cuando confirmes una compra, la vas a ver acá.</p>
            <Link to="/" className="boton boton-primario">
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
                <div className="compra-foto" aria-hidden="true">
                  <FotoVuelo
                    destinoIata=""
                    destinoCiudad={orden.items[0].destino}
                  />
                </div>

                <div className="compra-contenido">
                  <div className="compra-encabezado">
                    <div>
                      <strong>
                        Compra #{orden.id} · {numerosDeVuelo(orden).length === 1 ? 'Vuelo N°' : 'Vuelos N°'}{' '}
                        {numerosDeVuelo(orden).join(' · ')}
                      </strong>
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
                          onClick={() => setACancelar(orden)}
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
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* Renderizado condicional: el cartel aparece solo si hay una compra elegida para cancelar */}
      {aCancelar && (
        <Confirmacion
          titulo={`¿Cancelar la compra #${aCancelar.id}?`}
          mensaje="Se liberan los asientos y no se puede deshacer."
          textoConfirmar="Sí, cancelar compra"
          peligro
          onConfirmar={() => cancelar(aCancelar)}
          onCancelar={() => setACancelar(null)}
        />
      )}
    </>
  )
}

export default MisCompras
