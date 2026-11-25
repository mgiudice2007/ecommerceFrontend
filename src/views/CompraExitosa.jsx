import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useParams } from 'react-router-dom'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import Boleto from '../components/ordenes/Boleto'
import PagoAprobado from '../components/pago/PagoAprobado'
import PasosCompra from '../components/pago/PasosCompra'
import { fetchOrden } from '../redux/ordenesSlice'
import './DetalleOrden.css'

function CompraExitosa() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { ordenActual, error } = useSelector((state) => state.ordenes)

  const orden = ordenActual?.id === Number(id) ? ordenActual : null

  // Al llegar desde el pago la orden ya está en el store; al recargar la página hay que pedirla
  useEffect(() => {
    if (!orden) {
      dispatch(fetchOrden(id))
    }
  }, [id, orden, dispatch])

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

  if (orden.estado === 'CANCELADA') {
    return <Navigate to={`/mis-compras/${orden.id}`} replace />
  }

  return (
    <div className="contenedor pagina orden">
      <PasosCompra actual={4} />
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
