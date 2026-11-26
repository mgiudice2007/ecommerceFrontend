import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Confirmacion from '../components/Confirmacion'
import EncabezadoPagina from '../components/EncabezadoPagina'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import CuentaRegresiva from '../components/ordenes/CuentaRegresiva'
import TarjetaCompra from '../components/ordenes/TarjetaCompra'
import { usePortadas } from '../hooks/usePortadas'
import { proximoVuelo } from '../utils/ordenes'
import { avisar } from '../redux/avisosSlice'
import { cancelarOrden, fetchOrdenes, limpiarMensaje } from '../redux/ordenesSlice'
import { fetchPerfil } from '../redux/usuarioSlice'
import './MisCompras.css'

function MisCompras() {
  const dispatch = useDispatch()
  const { ordenes, mensaje, guardando, error } = useSelector((state) => state.ordenes)
  // Qué compra se está cancelando y cuál espera la confirmación: solo importan a esta pantalla
  const [cancelandoId, setCancelandoId] = useState(null)
  const [aCancelar, setACancelar] = useState(null)
  const portadas = usePortadas((ordenes ?? []).map((orden) => orden.items[0].vueloId))

  useEffect(() => {
    dispatch(fetchOrdenes())
  }, [dispatch])

  // Cuando el backend confirma la cancelación, su aviso sale flotante y se actualizan las millas del perfil
  useEffect(() => {
    if (mensaje) {
      dispatch(avisar(mensaje))
      dispatch(fetchPerfil())
      dispatch(limpiarMensaje())
    }
  }, [mensaje, dispatch])

  const cancelar = (orden) => {
    setACancelar(null)
    setCancelandoId(orden.id)
    dispatch(cancelarOrden(orden.id))
  }

  const proximo = proximoVuelo(ordenes)

  return (
    <>
      <EncabezadoPagina titulo="Mis compras" subtitulo="Revisá tus pasajes y cancelá una compra si cambian tus planes." />

      <div className="contenedor sobre-encabezado">
        {error && <Mensaje>{error}</Mensaje>}

        {!ordenes && !error && <Cargando texto="Cargando compras…" />}

        {proximo && <CuentaRegresiva proximo={proximo} />}

        {ordenes?.length === 0 && (
          <EstadoVacio
            className="compras-vacio"
            titulo="Todavía no compraste pasajes"
            texto="Cuando confirmes una compra, la vas a ver acá."
          >
            <Link to="/" className="boton boton-primario">
              Buscar vuelos
            </Link>
          </EstadoVacio>
        )}

        <div className="compras-lista">
          {ordenes?.map((orden) => (
            <TarjetaCompra
              key={orden.id}
              orden={orden}
              imagen={portadas[orden.items[0].vueloId]}
              cancelando={guardando && cancelandoId === orden.id}
              onCancelar={setACancelar}
            />
          ))}
        </div>
      </div>

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
