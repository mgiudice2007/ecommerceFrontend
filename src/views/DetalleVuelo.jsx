import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, urlFoto } from '../api/api'
import GaleriaFotos from '../components/GaleriaFotos'
import OpcionClase from '../components/OpcionClase'
import SelectorPasajeros from '../components/SelectorPasajeros'
import { useAuth } from '../context/AuthContext'
import { useCatalogo } from '../hooks/useCatalogo'
import { duracion, fechaLarga, hora, precio } from '../utils/formato'
import { leerPasajeros, TIPOS_PASAJERO, textoPasajeros, totalPasajeros } from '../utils/pasajeros'
import { estaOperativo, textoDescuento, textoEstado } from '../utils/vuelos'
import './DetalleVuelo.css'

function DetalleVuelo() {
  const { id } = useParams() // el :id de la ruta /vuelos/:id
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams() // trae los pasajeros elegidos en el buscador
  const { estaLogueado, esComprador, actualizarCarrito } = useAuth()
  const { clases } = useCatalogo()

  const [vuelo, setVuelo] = useState(null)
  const [fotos, setFotos] = useState([])
  const [error, setError] = useState('')

  const [elegida, setElegida] = useState(null) // la Disponibilidad (clase) elegida
  const [pasajeros, setPasajeros] = useState(leerPasajeros(searchParams)) // { adultos, ninos, bebes }
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  useEffect(() => {
    api(`/api/vuelos/${id}`)
      .then((data) => {
        setVuelo(data)
        // Arranca elegida la primera clase que tenga asientos
        setElegida(data.disponibilidades.find((d) => d.hayStock) ?? null)
      })
      .catch((err) => setError(err.message))

    // Las fotos van aparte: si fallan, el vuelo se muestra igual
    api(`/api/fotos?vueloId=${id}`)
      .then((data) => setFotos(data))
      .catch(() => setFotos([]))
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
  // Un vuelo demorado se sigue vendiendo (igual que en el backend)
  const sePuedeComprar = estaOperativo(vuelo) && !yaSalio && vuelo.hayStock
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)

  const elegirClase = (disponibilidad) => {
    setElegida(disponibilidad)
    setMensaje(null)
  }

  const cambiarPasajeros = (nuevos) => {
    setPasajeros(nuevos)
    setMensaje(null)
  }

  // Cada tipo de pasajero paga un porcentaje del precio de un adulto (igual que en el backend)
  const precioPara = (tipo) => (elegida.precioConDescuento * tipo.porcentaje) / 100
  let total = 0
  if (elegida) {
    TIPOS_PASAJERO.forEach((t) => {
      total = total + precioPara(t) * pasajeros[t.clave]
    })
  }

  const agregarAlCarrito = () => {
    if (!estaLogueado) {
      // Lo mandamos a loguearse y despues vuelve a este vuelo
      navigate('/login', { state: { desde: location.pathname } })
      return
    }

    setAgregando(true)
    setMensaje(null)
    // Un solo pedido con los adultos, ninos y bebes elegidos
    api('/api/carrito/pasajes', {
      method: 'POST',
      body: { disponibilidadId: elegida.id, ...pasajeros },
    })
      .then((carrito) => {
        actualizarCarrito(carrito)
        setMensaje({
          tipo: 'exito',
          texto: `Agregaste ${textoPasajeros(pasajeros)} en ${elegida.claseNombre} al carrito.`,
        })
      })
      .catch((err) => setMensaje({ tipo: 'error', texto: err.message }))
      .finally(() => setAgregando(false))
  }

  // La primera foto del vuelo es el fondo de la portada (si no tiene, queda el azul)
  const fondoPortada = fotos.length > 0 ? { backgroundImage: `url(${urlFoto(fotos[0].id)})` } : undefined

  return (
    <>
      <section className="detalle-portada" style={fondoPortada}>
        <div className="contenedor">
          <nav className="detalle-migas">
            <Link to="/vuelos">Vuelos</Link> / {vuelo.origenCiudad} → {vuelo.destinoCiudad}
          </nav>
          <div className="detalle-portada-etiquetas">
            <span>{vuelo.categoriaNombre}</span>
            {descuento && <span className="oferta">{descuento}</span>}
            {vuelo.estado !== 'ACTIVO' && (
              <span className={`estado-${vuelo.estado.toLowerCase()}`}>{textoEstado(vuelo.estado)}</span>
            )}
          </div>
          <h1>
            {vuelo.origenCiudad} → {vuelo.destinoCiudad}
          </h1>
          <p>
            Vuelo {vuelo.numeroVuelo} · Directo · {duracion(vuelo.duracionMinutos)} · {fechaLarga(vuelo.fechaSalida)}
          </p>
        </div>
      </section>

      <div className="contenedor detalle-cuerpo">
        <div className="detalle-layout">
          <div className="detalle-principal">
            <section className="tarjeta">
              <h2 className="detalle-subtitulo">Itinerario</h2>
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
                <p className="texto-suave">Todavía no hay asientos a la venta para este vuelo.</p>
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

            {fotos.length > 1 && (
              <section>
                <h2 className="detalle-subtitulo">Conocé {vuelo.destinoCiudad}</h2>
                <GaleriaFotos fotos={fotos} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
              </section>
            )}
          </div>

          <aside className="tarjeta detalle-compra">
            <h2>Tu selección</h2>

            {!sePuedeComprar ? (
              <div className="mensaje mensaje-error">
                {yaSalio
                  ? 'Este vuelo ya salió.'
                  : !estaOperativo(vuelo)
                    ? `Este vuelo está ${textoEstado(vuelo.estado).toLowerCase()} y no está a la venta.`
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

                <h3 className="detalle-pasajeros-titulo">Pasajeros</h3>
                <SelectorPasajeros
                  pasajeros={pasajeros}
                  onChange={cambiarPasajeros}
                  maximo={elegida.asientosDisponibles}
                />

                {/* Detalle del precio: una linea por cada tipo de pasajero */}
                {TIPOS_PASAJERO.filter((t) => pasajeros[t.clave] > 0).map((t) => (
                  <div key={t.clave} className="detalle-resumen">
                    <span>
                      {pasajeros[t.clave]} {pasajeros[t.clave] === 1 ? t.singular : t.titulo.toLowerCase()} ×{' '}
                      {precio(precioPara(t))}
                    </span>
                    <strong>{precio(precioPara(t) * pasajeros[t.clave])}</strong>
                  </div>
                ))}

                <div className="detalle-total">
                  <span>Total · {totalPasajeros(pasajeros)} pasajes</span>
                  <strong>{precio(total)}</strong>
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
    </>
  )
}

export default DetalleVuelo
