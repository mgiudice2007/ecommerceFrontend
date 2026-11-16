import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, pedirVuelos } from '../api/api'
import ItemCarrito from '../components/ItemCarrito'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ResumenCompra from '../components/carrito/ResumenCompra'
import SelectorMillas from '../components/carrito/SelectorMillas'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import { useAuth } from '../context/AuthContext'
import { calcularMillas, textoCantidadPasajes, vuelosSinAdulto } from '../utils/carrito'
import './Carrito.css'

function Carrito() {
  const { actualizarCarrito, recargarPerfil } = useAuth()
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState(null)
  const [comprando, setComprando] = useState(false)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [usarMillas, setUsarMillas] = useState(false)
  const [millasElegidas, setMillasElegidas] = useState('')
  const [vuelos, setVuelos] = useState({})

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

  const calculo = calcularMillas(carrito, usarMillas, millasElegidas)
  const sinAdulto = vuelosSinAdulto(carrito.items)
  const cantidadPasajes = carrito.items.reduce((total, item) => total + item.cantidad, 0)

  const elegirUsarMillas = (usar) => {
    setUsarMillas(usar)
    setMillasElegidas(String(calculo.maximo))
  }

  const confirmarCompra = () => {
    setComprando(true)
    setError('')
    const opciones = usarMillas ? { method: 'POST', body: { millas: calculo.aUsar } } : { method: 'POST' }
    api('/api/carrito/checkout', opciones)
      .then((orden) => {
        actualizarCarrito({ items: [] })
        recargarPerfil()
        navigate(`/mis-compras/${orden.id}`, { replace: true, state: { recienComprada: true } })
      })
      .catch((err) => {
        setError(err.message)
        setComprando(false)
      })
  }

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
          <div className="carrito-layout">
            <div className="carrito-items">
              {carrito.items.map((item) => (
                <ItemCarrito
                  key={item.id}
                  item={item}
                  vuelo={vuelos[item.vueloId]}
                  onCambiarCantidad={cambiarCantidad}
                  onEliminar={eliminar}
                  ocupado={ocupado}
                />
              ))}
            </div>

            <ResumenCompra
              items={carrito.items}
              calculo={calculo}
              selectorMillas={
                <SelectorMillas
                  usar={usarMillas}
                  onUsar={elegirUsarMillas}
                  disponibles={carrito.millasDisponibles}
                  valorMilla={carrito.valorMilla}
                  maximo={calculo.maximo}
                  elegidas={millasElegidas}
                  onElegir={setMillasElegidas}
                  problema={calculo.problema}
                />
              }
              sinAdulto={sinAdulto}
              comprando={comprando}
              bloqueado={ocupado || sinAdulto.length > 0 || calculo.problema !== ''}
              onConfirmar={confirmarCompra}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Carrito
