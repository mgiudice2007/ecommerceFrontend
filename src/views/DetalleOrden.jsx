import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Confirmacion from '../components/Confirmacion'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import Boleto from '../components/ordenes/Boleto'
import EncabezadoOrden from '../components/ordenes/EncabezadoOrden'
import { useAvisos } from '../context/AvisosContext'
import { cancelarOrden, fetchOrden, limpiarMensaje } from '../redux/ordenesSlice'
import { fetchPerfil } from '../redux/usuarioSlice'
import { textoCancelacion } from '../utils/ordenes'
import './DetalleOrden.css'

function DetalleOrden() {
  const { avisar } = useAvisos()
  const { id } = useParams()
  const dispatch = useDispatch()
  const { ordenActual, mensaje, guardando: cancelando, error } = useSelector((state) => state.ordenes)

  // El store guarda la última orden que se pidió: solo sirve si es la de esta página
  const orden = ordenActual?.id === Number(id) ? ordenActual : null
  const [preguntando, setPreguntando] = useState(false)

  useEffect(() => {
    dispatch(fetchOrden(id))
  }, [id, dispatch])

  // Cuando el backend confirma la cancelación, su aviso sale flotante y se actualizan las millas del perfil
  useEffect(() => {
    if (mensaje) {
      avisar(mensaje)
      dispatch(fetchPerfil())
      dispatch(limpiarMensaje())
    }
  }, [mensaje, avisar, dispatch])

  if (error && !orden) {
    return (
      <div className="contenedor pagina">
        <Mensaje>{error}</Mensaje>
        <Link to="/mis-compras">← Volver a mis compras</Link>
      </div>
    )
  }

  if (!orden) {
    return <Cargando pagina texto="Cargando compra…" />
  }

  const cancelada = orden.estado === 'CANCELADA'

  const cancelar = () => {
    setPreguntando(false)
    dispatch(cancelarOrden(orden.id))
  }

  return (
    <div className="contenedor pagina orden">
      <EncabezadoOrden orden={orden} />

      {error && <Mensaje>{error}</Mensaje>}
      {cancelada && <Mensaje>Esta compra está cancelada: los asientos se devolvieron al vuelo.</Mensaje>}

      <Boleto orden={orden} />

      <div className="orden-acciones">
        <Link to="/mis-compras" className="boton boton-primario">
          Ver mis compras
        </Link>
        <Link to="/" className="boton boton-secundario">
          Volver al inicio
        </Link>
        {orden.sePuedeCancelar && (
          <button className="boton boton-peligro" onClick={() => setPreguntando(true)} disabled={cancelando}>
            {cancelando ? 'Cancelando…' : 'Cancelar compra'}
          </button>
        )}
      </div>
      {!cancelada && <p className="texto-suave orden-cancelacion">{textoCancelacion(orden)}</p>}

      {preguntando && (
        <Confirmacion
          titulo={`¿Cancelar la compra #${orden.id}?`}
          mensaje="Se liberan los asientos y no se puede deshacer."
          textoConfirmar="Sí, cancelar compra"
          peligro
          onConfirmar={cancelar}
          onCancelar={() => setPreguntando(false)}
        />
      )}
    </div>
  )
}

export default DetalleOrden
