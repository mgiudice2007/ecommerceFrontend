import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { api } from '../api/api'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import Boleto from '../components/ordenes/Boleto'
import PagoAprobado from '../components/pago/PagoAprobado'
import PasosCompra from '../components/pago/PasosCompra'
import './DetalleOrden.css'

function CompraExitosa() {
  const { id } = useParams()
  const ordenRecibida = useLocation().state?.orden
  const [orden, setOrden] = useState(ordenRecibida ?? null)
  const [error, setError] = useState('')

  // Al llegar desde el pago la orden ya viene en la navegacion; al recargar la pagina hay que pedirla
  useEffect(() => {
    if (ordenRecibida) return
    api(`/api/ordenes/${id}`)
      .then(setOrden)
      .catch((err) => setError(err.message))
  }, [id, ordenRecibida])

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

  if (orden.estado === 'CANCELADA') {
    return <Navigate to={`/mis-compras/${orden.id}`} replace />
  }

  return (
    <div className="contenedor pagina orden">
      <PasosCompra actual={3} />
      <PagoAprobado orden={orden} />
      <Boleto orden={orden} />

      <div className="orden-acciones">
        <Link to="/mis-compras" className="boton boton-primario">
          Ver mis compras
        </Link>
        <Link to="/" className="boton boton-secundario">
          Seguir buscando
        </Link>
      </div>
    </div>
  )
}

export default CompraExitosa
