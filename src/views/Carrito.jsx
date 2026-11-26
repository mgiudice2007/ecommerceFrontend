import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import ItemCarrito from '../components/ItemCarrito'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ResumenCompra from '../components/carrito/ResumenCompra'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import PasosCompra from '../components/pago/PasosCompra'
import { usePortadas } from '../hooks/usePortadas'
import { cambiarCantidad, eliminarItem, fetchCarrito, fetchVuelosDelCarrito } from '../redux/carritoSlice'
import { calcularMillas, textoCantidadPasajes, vuelosSinAdulto } from '../utils/carrito'
import './Carrito.css'

function Carrito() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { carrito, vuelosDelCarrito, guardando, error } = useSelector((state) => state.carrito)
  const portadas = usePortadas((carrito?.items ?? []).map((item) => item.vueloId))

  useEffect(() => {
    dispatch(fetchCarrito())
  }, [dispatch])

  // Se piden solo los vuelos que todavía no están en el store
  const vueloIdsFaltantes = (carrito?.items ?? [])
    .map((item) => item.vueloId)
    .filter((vueloId) => !(vueloId in vuelosDelCarrito))
  const faltantes = [...new Set(vueloIdsFaltantes)].join(',')

  useEffect(() => {
    if (faltantes) {
      dispatch(fetchVuelosDelCarrito(faltantes.split(',').map(Number)))
    }
  }, [faltantes, dispatch])

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
                    vuelo={vuelosDelCarrito[item.vueloId]}
                    imagen={portadas[item.vueloId]}
                    onCambiarCantidad={(pasaje, cantidad) => dispatch(cambiarCantidad({ itemId: pasaje.id, cantidad }))}
                    onEliminar={(pasaje) => dispatch(eliminarItem(pasaje.id))}
                    ocupado={guardando}
                  />
                ))}
              </div>

              <ResumenCompra
                items={carrito.items}
                calculo={calculo}
                aclaracion="Los precios ya incluyen los descuentos vigentes. En el próximo paso elegís cómo pagar."
                sinAdulto={sinAdulto}
                procesando={false}
                bloqueado={guardando || sinAdulto.length > 0}
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
