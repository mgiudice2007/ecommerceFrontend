import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/api'
import GaleriaFotos from '../components/GaleriaFotos'
import OpcionClase from '../components/OpcionClase'
import { useAuth } from '../context/AuthContext'
import { useCatalogo } from '../hooks/useCatalogo'
import { duracion, fechaLarga, hora, precio } from '../utils/formato'
import { textoDescuento } from '../utils/vuelos'
import './DetalleVuelo.css'

function DetalleVuelo() {
  const { id } = useParams() // el :id de la ruta /vuelos/:id
  const navigate = useNavigate()
  const location = useLocation()
  const { estaLogueado, esComprador, actualizarCarrito } = useAuth()
  const { clases } = useCatalogo()

  const [vuelo, setVuelo] = useState(null)
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState('')

  const [elegida, setElegida] = useState(null) // la Disponibilidad (clase) elegida
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  useEffect(() => {
    // El vuelo y sus fotos se piden al mismo tiempo
    Promise.all([api(`/api/vuelos/${id}`), api(`/api/fotos?vueloId=${id}`)])
      .then(([datosVuelo, datosFotos]) => {
        setVuelo(datosVuelo)
        setFotos(datosFotos)
        // Arranca elegida la primera clase que tenga asientos
        setElegida(datosVuelo.disponibilidades.find((d) => d.hayStock) ?? null)
      })
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <div className="contenedor pagina">
        <div className="mensaje mensaje-error">{error}</div>
        <Link to="/vuelos">← Volver a la búsqueda</Link>
      </div>
    )
  }

  if (!vuelo) {
    return <div className="contenedor pagina texto-suave">Cargando vuelo…</div>
  }

  const yaSalio = new Date(vuelo.fechaSalida) < new Date()
  const sePuedeComprar = vuelo.estado === 'ACTIVO' && !yaSalio && vuelo.hayStock
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)

  const elegirClase = (disponibilidad) => {
    setElegida(disponibilidad)
    setCantidad(1)
    setMensaje(null)
  }

  const cambiarCantidad = (nueva) => {
    if (nueva >= 1 && nueva <= elegida.asientosDisponibles) {
      setCantidad(nueva)
    }
  }

  const agregarAlCarrito = async () => {
    if (!estaLogueado) {
      // Lo mandamos a loguearse y despues vuelve a este vuelo
      navigate('/login', { state: { desde: location.pathname } })
      return
    }

    setAgregando(true)
    setMensaje(null)
    try {
      const carrito = await api('/api/carrito/items', {
        method: 'POST',
        body: { disponibilidadId: elegida.id, cantidad },
      })
      actualizarCarrito(carrito)
      setMensaje({ tipo: 'exito', texto: `Agregaste ${cantidad} pasaje(s) en ${elegida.claseNombre} al carrito.` })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setAgregando(false)
    }
  }

  return (
    <div className="contenedor pagina">
      <nav className="detalle-migas">
        <Link to="/vuelos">Vuelos</Link> / {vuelo.origenCiudad} → {vuelo.destinoCiudad}
      </nav>

      <div className="detalle-layout">
        <div className="detalle-principal">
          <GaleriaFotos fotos={fotos} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />

          <section className="tarjeta">
            <div className="detalle-encabezado">
              <div>
                <span className="etiqueta">{vuelo.categoriaNombre}</span>
                {descuento && <span className="etiqueta etiqueta-descuento">{descuento}</span>}
                <h1>
                  {vuelo.origenCiudad} → {vuelo.destinoCiudad}
                </h1>
                <p className="texto-suave">Vuelo {vuelo.numeroVuelo} · Directo</p>
              </div>
            </div>

            <div className="detalle-itinerario">
              <div>
                <small>Salida · {fechaLarga(vuelo.fechaSalida)}</small>
                <strong>{hora(vuelo.fechaSalida)}</strong>
                <span>
                  {vuelo.origenIata} · {vuelo.origenCiudad}
                </span>
              </div>
              <div className="detalle-duracion">
                <span>{duracion(vuelo.duracionMinutos)}</span>
                <small>Directo</small>
              </div>
              <div className="derecha">
                <small>Llegada · {fechaLarga(vuelo.fechaLlegada)}</small>
                <strong>{hora(vuelo.fechaLlegada)}</strong>
                <span>
                  {vuelo.destinoIata} · {vuelo.destinoCiudad}
                </span>
              </div>
            </div>

            {vuelo.descripcion && <p className="detalle-descripcion">{vuelo.descripcion}</p>}
          </section>

          <section>
            <h2 className="detalle-subtitulo">Seleccioná tu clase</h2>
            {vuelo.disponibilidades.length === 0 ? (
              <p className="texto-suave">El vendedor todavía no cargó asientos para este vuelo.</p>
            ) : (
              <div className="detalle-clases">
                {vuelo.disponibilidades.map((d) => (
                  <OpcionClase
                    key={d.id}
                    disponibilidad={d}
                    clase={clases.find((c) => c.id === d.claseId)}
                    seleccionada={elegida?.id === d.id}
                    onElegir={elegirClase}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="tarjeta detalle-compra">
          <h2>Tu selección</h2>

          {!sePuedeComprar ? (
            <div className="mensaje mensaje-error">
              {yaSalio
                ? 'Este vuelo ya salió.'
                : vuelo.estado !== 'ACTIVO'
                  ? 'Este vuelo ya no está a la venta.'
                  : 'No quedan asientos en este vuelo.'}
            </div>
          ) : !elegida ? (
            <p className="texto-suave">Elegí una clase para continuar.</p>
          ) : (
            <>
              <div className="detalle-resumen">
                <span>Clase</span>
                <strong>{elegida.claseNombre}</strong>
              </div>
              <div className="detalle-resumen">
                <span>Precio por pasajero</span>
                <strong>{precio(elegida.precioConDescuento)}</strong>
              </div>

              <div className="detalle-resumen">
                <span>Pasajes</span>
                <div className="contador">
                  <button onClick={() => cambiarCantidad(cantidad - 1)} disabled={cantidad <= 1} aria-label="Restar">
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(cantidad + 1)}
                    disabled={cantidad >= elegida.asientosDisponibles}
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detalle-total">
                <span>Total</span>
                <strong>{precio(elegida.precioConDescuento * cantidad)}</strong>
              </div>

              {mensaje && <div className={`mensaje mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>}

              {estaLogueado && !esComprador ? (
                <p className="texto-suave">Solo las cuentas de comprador pueden comprar pasajes.</p>
              ) : (
                <button className="boton boton-primario boton-ancho" onClick={agregarAlCarrito} disabled={agregando}>
                  {agregando ? 'Agregando…' : estaLogueado ? 'Agregar al carrito' : 'Iniciá sesión para comprar'}
                </button>
              )}

              {mensaje?.tipo === 'exito' && (
                <Link to="/carrito" className="boton boton-secundario boton-ancho detalle-ir-carrito">
                  Ir al carrito →
                </Link>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

export default DetalleVuelo
