import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ResumenCompra from '../components/carrito/ResumenCompra'
import SelectorMillas from '../components/carrito/SelectorMillas'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import DetallePago from '../components/pago/DetallePago'
import PasosCompra from '../components/pago/PasosCompra'
import SelectorMedioPago from '../components/pago/SelectorMedioPago'
import { useAuth } from '../context/AuthContext'
import { calcularMillas, vuelosSinAdulto } from '../utils/carrito'
import {
  MEDIOS_PAGO,
  TARJETA_INICIAL,
  esTarjeta,
  formatearCampoTarjeta,
  ultimosCuatro,
  validarTarjeta,
} from '../utils/pagos'
import './Carrito.css'
import './Checkout.css'

function Checkout() {
  const { actualizarCarrito, recargarPerfil } = useAuth()
  const navigate = useNavigate()
  const [carrito, setCarrito] = useState(null)
  const [error, setError] = useState('')
  const [medio, setMedio] = useState('TARJETA_CREDITO')
  const [tarjeta, setTarjeta] = useState(TARJETA_INICIAL)
  const [intento, setIntento] = useState(false)
  const [usarMillas, setUsarMillas] = useState(false)
  const [millasElegidas, setMillasElegidas] = useState('')
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    api('/api/carrito')
      .then(setCarrito)
      .catch((err) => setError(err.message))
  }, [])

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {error ? <Mensaje>{error}</Mensaje> : <Cargando texto="Preparando el pago…" />}
      </div>
    )
  }

  if (carrito.items.length === 0) {
    return (
      <div className="contenedor pagina">
        <EstadoVacio titulo="No hay nada para pagar" texto="Tu carrito está vacío.">
          <Link to="/" className="boton boton-primario">
            Buscar vuelos
          </Link>
        </EstadoVacio>
      </div>
    )
  }

  const calculo = calcularMillas(carrito, usarMillas, millasElegidas)
  const sinAdulto = vuelosSinAdulto(carrito.items)
  const millasCubrenTodo = calculo.aUsar > 0 && calculo.aPagar === 0
  const errores = !millasCubrenTodo && esTarjeta(medio) ? validarTarjeta(tarjeta) : {}
  const hayErrores = Object.keys(errores).length > 0

  const elegirUsarMillas = (usar) => {
    setUsarMillas(usar)
    setMillasElegidas(String(calculo.maximo))
  }

  const cambiarTarjeta = (e) => {
    const { name, value } = e.target
    setTarjeta({ ...tarjeta, [name]: formatearCampoTarjeta(name, value) })
  }

  const pagar = () => {
    setIntento(true)
    if (hayErrores) return

    // Del pago solo viaja el medio y, si es tarjeta, los ultimos 4 digitos: el numero completo nunca sale del navegador
    const pedido = { medioPago: millasCubrenTodo ? 'MILLAS' : medio }
    if (usarMillas) pedido.millas = calculo.aUsar
    if (esTarjeta(pedido.medioPago)) pedido.ultimosDigitos = ultimosCuatro(tarjeta.numero)

    setPagando(true)
    setError('')
    api('/api/carrito/checkout', { method: 'POST', body: pedido })
      .then((orden) => {
        actualizarCarrito({ items: [] })
        recargarPerfil()
        navigate(`/compra-exitosa/${orden.id}`, { replace: true, state: { orden } })
      })
      .catch((err) => {
        setError(err.message)
        setPagando(false)
      })
  }

  return (
    <>
      <EncabezadoPagina titulo="Pago" subtitulo="Elegí cómo pagar y confirmá tu compra." />

      <div className="contenedor sobre-encabezado">
        <PasosCompra actual={1} />
        {error && <Mensaje>{error}</Mensaje>}

        <div className="carrito-layout">
          <section className="tarjeta checkout-medios">
            {millasCubrenTodo ? (
              <>
                <h2>Pagás todo con millas</h2>
                <p className="texto-suave">
                  Con {calculo.aUsar.toLocaleString('es-AR')} millas cubrís el total de la compra: no hace falta elegir otro
                  medio de pago.
                </p>
              </>
            ) : (
              <>
                <SelectorMedioPago medios={MEDIOS_PAGO} elegido={medio} onElegir={setMedio} />
                <div className="checkout-detalle">
                  <DetallePago
                    medio={medio}
                    tarjeta={tarjeta}
                    errores={intento ? errores : {}}
                    total={calculo.aPagar}
                    onCambiarTarjeta={cambiarTarjeta}
                  />
                </div>
              </>
            )}
            <p className="texto-suave checkout-simulado">
              Pago simulado: no se realiza ningún cobro ni se guardan los datos de tu tarjeta.
            </p>
          </section>

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
            aclaracion="Los precios ya incluyen los descuentos vigentes. Al pagar, tus asientos quedan reservados."
            sinAdulto={sinAdulto}
            procesando={pagando}
            bloqueado={sinAdulto.length > 0 || calculo.problema !== ''}
            textoBoton="Pagar"
            textoProcesando="Procesando pago…"
            enlace={{ to: '/carrito', texto: 'Volver al carrito' }}
            onConfirmar={pagar}
          />
        </div>
      </div>
    </>
  )
}

export default Checkout
