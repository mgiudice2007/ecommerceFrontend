import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import Confirmacion from '../components/Confirmacion'
import EncabezadoPagina from '../components/EncabezadoPagina'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import TarjetaCompra from '../components/ordenes/TarjetaCompra'
import { useAuth } from '../context/AuthContext'
import { useAvisos } from '../context/AvisosContext'
import { cancelarOrden } from '../utils/ordenes'
import './MisCompras.css'

function MisCompras() {
  const { recargarPerfil } = useAuth()
  const [ordenes, setOrdenes] = useState(null)
  const [error, setError] = useState('')
  const { avisar } = useAvisos()
  const [cancelando, setCancelando] = useState(null)
  const [aCancelar, setACancelar] = useState(null)

  useEffect(() => {
    api('/api/ordenes')
      .then(setOrdenes)
      .catch((err) => setError(err.message))
  }, [])

  const cancelar = (orden) => {
    setACancelar(null)
    setError('')
    setCancelando(orden.id)
    cancelarOrden(orden)
      .then((actualizada) => {
        setOrdenes(ordenes.map((o) => (o.id === actualizada.id ? actualizada : o)))
        recargarPerfil()
        avisar(`Cancelaste la compra #${actualizada.id}. Los asientos volvieron a estar disponibles.`)
      })
      .catch((err) => setError(err.message))
      .finally(() => setCancelando(null))
  }

  return (
    <>
      <EncabezadoPagina titulo="Mis compras" subtitulo="Revisá tus pasajes y cancelá una compra si cambian tus planes." />

      <div className="contenedor sobre-encabezado">
        {error && <Mensaje>{error}</Mensaje>}

        {!ordenes && !error && <Cargando texto="Cargando compras…" />}

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
              cancelando={cancelando === orden.id}
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
