import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, pedirVuelos } from '../api/api'
import ItemCarrito from '../components/ItemCarrito'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ResumenCompra from '../components/carrito/ResumenCompra'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import PasosCompra from '../components/pago/PasosCompra'
import { useAuth } from '../context/AuthContext'
import { usePortadas } from '../hooks/usePortadas'
import { calcularMillas, textoCantidadPasajes, vuelosSinAdulto } from '../utils/carrito'
import './Carrito.css'

function Carrito() {
  const { actualizarCarrito } = useAuth()
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState(null)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [vuelos, setVuelos] = useState({})
  const portadas = usePortadas((carrito?.items ?? []).map((item) => ({ id: item.vueloId })))

  useEffect(() => {
    api('/api/carrito')
      .then((data) => {
        setCarrito(data)
        const ids = data.items.map((item) => item.vueloId)
        pedirVuelos(ids).then((datos) => setVuelos(datos))
      })
      .catch((err) => setError(err.message))
  }, [])

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

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {error ? <Mensaje>{error}</Mensaje> : <Cargando texto="Cargando carrito…" />}
      </div>
    )
  }

  const calculo = calcularMillas(carrito, false, '')
  const sinAdulto = vuelosSinAdulto(carrito.items)
  const cantidadPasajes = carrito.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <>
      <EncabezadoPagina titulo="Mi carrito" subtitulo={textoCantidadPasajes(cantidadPasajes)} />

      <div className="contenedor sobre-encabezado">
        {error && <Mensaje>{error}</Mensaje>}

        {carrito.items.length === 0 ? (
          <EstadoVacio titulo="Tu carrito está vacío" texto="Buscá un vuelo, elegí la clase y agregalo para comprarlo.">
            <Link to="/" className="boton boton-primario">
              Buscar vuelos
            </Link>
          </EstadoVacio>
        ) : (
          <>
            <PasosCompra actual={0} />
            <div className="carrito-layout">
              <div className="carrito-items">
                {carrito.items.map((item) => (
                  <ItemCarrito
                    key={item.id}
                    item={item}
                    vuelo={vuelos[item.vueloId]}
                    imagen={portadas[item.vueloId]}
                    onCambiarCantidad={cambiarCantidad}
                    onEliminar={eliminar}
                    ocupado={ocupado}
                  />
                ))}
              </div>

              <ResumenCompra
                items={carrito.items}
                calculo={calculo}
                aclaracion="Los precios ya incluyen los descuentos vigentes. En el próximo paso elegís cómo pagar."
                sinAdulto={sinAdulto}
                procesando={false}
                bloqueado={ocupado || sinAdulto.length > 0}
                textoBoton="Continuar al pago"
                enlace={{ to: '/', texto: 'Seguir buscando vuelos' }}
                onConfirmar={() => navigate('/checkout')}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Carrito
