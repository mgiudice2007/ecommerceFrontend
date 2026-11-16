import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../api/api'
import Confirmacion from '../components/Confirmacion'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import Boleto from '../components/ordenes/Boleto'
import EncabezadoOrden from '../components/ordenes/EncabezadoOrden'
import { useAuth } from '../context/AuthContext'
import { cancelarOrden, textoCancelacion } from '../utils/ordenes'
import './DetalleOrden.css'

function DetalleOrden() {
  const { recargarPerfil } = useAuth()
  const { id } = useParams()
  const location = useLocation()
  const recienComprada = location.state?.recienComprada === true

  const [orden, setOrden] = useState(null)
  const [error, setError] = useState('')
  const [cancelando, setCancelando] = useState(false)
  const [preguntando, setPreguntando] = useState(false)

  useEffect(() => {
    api(`/api/ordenes/${id}`)
      .then(setOrden)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
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
    setCancelando(true)
    cancelarOrden(orden)
      .then((actualizada) => {
        setOrden(actualizada)
        recargarPerfil()
      })
      .catch((err) => setError(err.message))
      .finally(() => setCancelando(false))
  }

  return (
    <div className="contenedor pagina orden">
      <EncabezadoOrden orden={orden} recienComprada={recienComprada && !cancelada} />

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
