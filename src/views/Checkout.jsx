import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import EncabezadoPagina from '../components/EncabezadoPagina'
import ResumenCompra from '../components/carrito/ResumenCompra'
import SelectorMillas from '../components/carrito/SelectorMillas'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import DetallePago from '../components/pago/DetallePago'
import PasosCompra from '../components/pago/PasosCompra'
import SelectorMedioPago from '../components/pago/SelectorMedioPago'
import PasoPasajeros from '../components/pasajeros/PasoPasajeros'
import { fetchCarrito } from '../redux/carritoSlice'
import { confirmarCompra, reiniciarConfirmada } from '../redux/ordenesSlice'
import { fetchPerfil } from '../redux/usuarioSlice'
import { calcularMillas, vuelosSinAdulto } from '../utils/carrito'
import { armarPersonas, pedidoDePasajeros, validarPersonas } from '../utils/datosPasajeros'
import {
  MEDIOS_PAGO,
  TARJETA_DEMO,
  TARJETA_INICIAL,
  esTarjeta,
  formatearCampoTarjeta,
  ultimosCuatro,
  validarTarjeta,
} from '../utils/pagos'
import './Carrito.css'
import './Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { carrito, error: errorCarrito } = useSelector((state) => state.carrito)
  const { ordenConfirmada, guardando: pagando, error: errorDelPago } = useSelector((state) => state.ordenes)
  const [error, setError] = useState('')
  const [medio, setMedio] = useState('TARJETA_CREDITO')
  const [tarjeta, setTarjeta] = useState(TARJETA_INICIAL)
  const [intento, setIntento] = useState(false)
  const [usarMillas, setUsarMillas] = useState(false)
  const [millasElegidas, setMillasElegidas] = useState('')
  const [paso, setPaso] = useState('pasajeros')
  // Lo que se fue escribiendo de cada persona, por clave: el resto de sus datos sale del carrito
  const [cambios, setCambios] = useState({})
  const [intentoPasajeros, setIntentoPasajeros] = useState(false)

  useEffect(() => {
    dispatch(reiniciarConfirmada())
    dispatch(fetchCarrito())
  }, [dispatch])

  // Cuando el backend confirma el pago, se actualizan las millas del perfil y se sigue a la compra exitosa
  useEffect(() => {
    if (ordenConfirmada) {
      dispatch(fetchPerfil())
      dispatch(reiniciarConfirmada())
      navigate(`/compra-exitosa/${ordenConfirmada}`, { replace: true })
    }
  }, [ordenConfirmada, dispatch, navigate])

  if (!carrito) {
    return (
      <div className="contenedor pagina">
        {errorCarrito ? <Mensaje>{errorCarrito}</Mensaje> : <Cargando texto="Preparando el pago…" />}
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

  const personas = armarPersonas(carrito.items).map((persona) => ({ ...persona, ...cambios[persona.clave] }))
  const erroresPasajeros = validarPersonas(personas, carrito.items)

  const cambiarPersona = (clave, campo, valor) => setCambios({ ...cambios, [clave]: { ...cambios[clave], [campo]: valor } })

  const continuar = () => {
    setIntentoPasajeros(true)
    if (Object.keys(erroresPasajeros).length > 0) {
      setError('Revisá los datos de los pasajeros: hay campos para corregir.')
      return
    }
    setError('')
    setPaso('pago')
  }

  const elegirUsarMillas = (usar) => {
    setUsarMillas(usar)
    setMillasElegidas(String(calculo.maximo))
  }

  const cambiarTarjeta = (e) => {
    const { name, value } = e.target
    setTarjeta({ ...tarjeta, [name]: formatearCampoTarjeta(name, value) })
  }

  // Para la demo: completa la tarjeta de una sin tipear campo por campo (las cuotas elegidas se mantienen)
  const rellenarTarjeta = () => setTarjeta({ ...tarjeta, ...TARJETA_DEMO })

  const pagar = () => {
    setIntento(true)
    if (hayErrores) return

    // Del pago solo viaja el medio y, si es tarjeta, los ultimos 4 digitos: el numero completo nunca sale del navegador
    const pedido = { medioPago: millasCubrenTodo ? 'MILLAS' : medio, pasajeros: pedidoDePasajeros(personas, carrito.items) }
    if (usarMillas) pedido.millas = calculo.aUsar
    if (esTarjeta(pedido.medioPago)) pedido.ultimosDigitos = ultimosCuatro(tarjeta.numero)

    setError('')
    dispatch(confirmarCompra(pedido))
  }

  return (
    <>
      <EncabezadoPagina
        titulo={paso === 'pasajeros' ? 'Pasajeros' : 'Pago'}
        subtitulo={
          paso === 'pasajeros'
            ? 'Antes de pagar, cargá los datos de cada persona que viaja.'
            : 'Elegí cómo pagar y confirmá tu compra.'
        }
      />

      <div className="contenedor sobre-encabezado">
        <PasosCompra actual={paso === 'pasajeros' ? 1 : 2} />
        {error && <Mensaje>{error}</Mensaje>}
        {errorDelPago && <Mensaje>{errorDelPago}</Mensaje>}

        <div className="carrito-layout">
          {paso === 'pasajeros' ? (
            <PasoPasajeros
              personas={personas}
              items={carrito.items}
              errores={intentoPasajeros ? erroresPasajeros : {}}
              onCambiar={cambiarPersona}
            />
          ) : (
            <section className="tarjeta checkout-medios">
              <button type="button" className="checkout-editar-pasajeros" onClick={() => setPaso('pasajeros')}>
                ← Editar datos de los pasajeros
              </button>
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
                      onRellenarTarjeta={rellenarTarjeta}
                    />
                  </div>
                </>
              )}
              <p className="texto-suave checkout-simulado">
                Pago simulado: no se realiza ningún cobro ni se guardan los datos de tu tarjeta.
              </p>
            </section>
          )}

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
            textoBoton={paso === 'pasajeros' ? 'Continuar al pago' : 'Pagar'}
            textoProcesando="Procesando pago…"
            enlace={{ to: '/carrito', texto: 'Volver al carrito' }}
            onConfirmar={paso === 'pasajeros' ? continuar : pagar}
          />
        </div>
      </div>
    </>
  )
}

export default Checkout
