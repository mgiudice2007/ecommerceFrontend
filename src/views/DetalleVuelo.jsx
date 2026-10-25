import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, pedirImagen } from '../api/api'
import GaleriaFotos from '../components/GaleriaFotos'
import OpcionClase from '../components/OpcionClase'
import SelectorAsientos from '../components/SelectorAsientos'
import SelectorPasajeros from '../components/SelectorPasajeros'
import { useAuth } from '../context/AuthContext'
import { duracion, fechaLarga, hora, precio, precioOGratis } from '../utils/formato'
import { leerPasajeros, TIPOS_PASAJERO, textoPasajeros, totalPasajeros } from '../utils/pasajeros'
import { estaOperativo, textoDescuento, textoEstado } from '../utils/vuelos'
import './DetalleVuelo.css'

function DetalleVuelo() {
  const { id } = useParams() // el :id de la ruta /vuelos/:id
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams() // trae los pasajeros elegidos en el buscador
  const { estaLogueado, esComprador, actualizarCarrito } = useAuth()
  // Datos del catalogo para los selects (si falla un pedido, ese select queda vacio)
  const [clases, setClases] = useState([])

  useEffect(() => {
    api('/api/clases')
      .then((data) => setClases(data))
      .catch(() => setClases([]))
  }, [])

  const [vuelo, setVuelo] = useState(null)
  const [imagenes, setImagenes] = useState([]) // las fotos del vuelo ya convertidas en imagen (data URL)
  const [error, setError] = useState('')

  const [elegida, setElegida] = useState(null) // la Disponibilidad (clase) elegida
  const [pasajeros, setPasajeros] = useState(leerPasajeros(searchParams)) // { adultos, ninos, bebes }
  // Si viene de iniciar sesion, la URL trae la clase y los asientos que habia elegido (?clase=127&asientos=7A,7B)
  const [claseInicial] = useState(searchParams.get('clase'))
  const [asientos, setAsientos] = useState(searchParams.get('asientos') ? searchParams.get('asientos').split(',') : []) // asientos elegidos: primero los de los adultos y despues los de los niños
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'exito' | 'error', texto }

  useEffect(() => {
    api(`/api/vuelos/${id}`)
      .then((data) => {
        setVuelo(data)
        // Arranca elegida la clase que venia en la URL, o si no la primera que tenga asientos
        const deLaUrl = data.disponibilidades.find((d) => String(d.id) === claseInicial && d.hayStock)
        setElegida(deLaUrl ?? data.disponibilidades.find((d) => d.hayStock) ?? null)
      })
      .catch((err) => setError(err.message))

    // Las fotos van aparte: si fallan, el vuelo se muestra igual.
    // Primero la lista de fotos y despues la imagen (en Base64) de cada una.
    // La primera es el fondo de la portada y todas juntas arman la galeria.
    api(`/api/fotos?vueloId=${id}`)
      .then((fotos) => Promise.all(fotos.map((foto) => pedirImagen(foto.id))))
      .then((data) => setImagenes(data))
      .catch(() => setImagenes([]))
  }, [id, claseInicial])

  // El mapa de asientos de la clase elegida (GET /api/disponibilidades/{id}/asientos).
  // Se guarda junto con el id de la clase que lo pidio: si el usuario cambia de clase,
  // hasta que llegue el mapa nuevo no se muestra el de la clase anterior.
  const [mapa, setMapa] = useState({ disponibilidadId: null, datos: null, error: '' })
  const elegidaId = elegida?.id

  useEffect(() => {
    if (!elegidaId) return
    api(`/api/disponibilidades/${elegidaId}/asientos`)
      .then((datos) => setMapa({ disponibilidadId: elegidaId, datos, error: '' }))
      .catch((err) => setMapa({ disponibilidadId: elegidaId, datos: null, error: err.message }))
  }, [elegidaId])

  if (error) {
    return (
      <div className="contenedor pagina">
        <div className="mensaje mensaje-error">{error}</div>
        <Link to="/">← Volver al inicio</Link>
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
    setAsientos([]) // cada clase tiene su propio mapa de asientos
    setMensaje(null)
  }

  const cambiarPasajeros = (nuevos) => {
    setPasajeros(nuevos)
    // Si ahora viajan menos personas, sobran asientos elegidos: se quedan los primeros
    setAsientos(asientos.slice(0, nuevos.adultos + nuevos.ninos))
    setMensaje(null)
  }

  const cambiarAsientos = (nuevos) => {
    setAsientos(nuevos)
    setMensaje(null)
  }

  // Los bebés viajan a upa: solo eligen asiento los adultos y los niños
  const necesitanAsiento = pasajeros.adultos + pasajeros.ninos
  const faltanAsientos = necesitanAsiento - asientos.length

  // Cada tipo de pasajero paga un porcentaje del precio de un adulto (igual que en el backend)
  const precioPara = (tipo) => (elegida.precioConDescuento * tipo.porcentaje) / 100
  let total = 0
  if (elegida) {
    TIPOS_PASAJERO.forEach((t) => {
      total = total + precioPara(t) * pasajeros[t.clave]
    })
  }

  // Ida y vuelta: si este es el vuelo de ida, despues de agregarlo se sigue con el de vuelta
  const eligiendoIda = searchParams.get('viaje') === 'idavuelta' && searchParams.get('tramo') === 'ida'

  // Vuelve a la lista de resultados mostrando solo los vuelos de vuelta
  const irAElegirVuelta = (pasajerosActuales) => {
    const params = new URLSearchParams()
    for (const clave of ['viaje', 'origen', 'destino', 'ida', 'vuelta']) {
      if (searchParams.get(clave)) params.set(clave, searchParams.get(clave))
    }
    params.set('adultos', pasajerosActuales.adultos)
    params.set('ninos', pasajerosActuales.ninos)
    params.set('bebes', pasajerosActuales.bebes)
    params.set('tramo', 'vuelta')
    navigate(`/vuelos?${params.toString()}`)
  }

  const agregarAlCarrito = (seguirConVuelta = false) => {
    if (!estaLogueado) {
      // Lo mandamos a loguearse y despues vuelve a este vuelo con lo que ya habia elegido:
      // los pasajeros, la clase y los asientos van en la URL de vuelta
      const params = new URLSearchParams()
      params.set('adultos', pasajeros.adultos)
      params.set('ninos', pasajeros.ninos)
      params.set('bebes', pasajeros.bebes)
      if (elegida) params.set('clase', elegida.id)
      if (asientos.length > 0) params.set('asientos', asientos.join(','))
      // Si es un viaje de ida y vuelta, se conserva para poder seguir con el vuelo de vuelta
      for (const clave of ['viaje', 'origen', 'destino', 'ida', 'vuelta', 'tramo']) {
        if (searchParams.get(clave)) params.set(clave, searchParams.get(clave))
      }
      navigate('/login', { state: { desde: `${location.pathname}?${params.toString()}` } })
      return
    }

    setAgregando(true)
    setMensaje(null)
    // Un solo pedido con los adultos, niños y bebés elegidos
    api('/api/carrito/pasajes', {
      method: 'POST',
      body: { disponibilidadId: elegida.id, ...pasajeros, asientos },
    })
      .then((carrito) => {
        actualizarCarrito(carrito)
        if (seguirConVuelta) {
          // La ida ya quedo en el carrito: se pasa directo a elegir la vuelta
          irAElegirVuelta(pasajeros)
          return
        }
        setMensaje({
          tipo: 'exito',
          texto: `Agregaste ${textoPasajeros(pasajeros)} en ${elegida.claseNombre} al carrito (asientos ${asientos.join(', ')}).`,
        })
        setAsientos([])
      })
      .catch((err) => setMensaje({ tipo: 'error', texto: err.message }))
      .finally(() => setAgregando(false))
  }

  // La primera foto del vuelo es el fondo de la portada (si no tiene, queda el azul)
  const fondoPortada = imagenes.length > 0 ? { backgroundImage: `url("${imagenes[0]}")` } : undefined

  return (
    <>
      <section className="detalle-portada" style={fondoPortada}>
        <div className="contenedor">
          <nav className="detalle-migas">
            {/* "Vuelos" vuelve a la busqueda de esta misma ruta */}
            <Link to={`/vuelos?origen=${vuelo.origenIata}&destino=${vuelo.destinoIata}`}>Vuelos</Link> /{' '}
            {vuelo.origenCiudad} → {vuelo.destinoCiudad}
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

            {sePuedeComprar && elegida && (
              <section>
                <h2 className="detalle-subtitulo">Elegí tus asientos</h2>
                <p className="texto-suave detalle-asientos-ayuda">
                  Es gratis. Tocá un asiento libre o usá "Asiento aleatorio".
                  {pasajeros.bebes > 0 && ' Los bebés viajan a upa, sin asiento propio.'}
                </p>
                <SelectorAsientos
                  mapa={mapa.disponibilidadId === elegida.id ? mapa.datos : null}
                  error={mapa.disponibilidadId === elegida.id ? mapa.error : ''}
                  grupo={{
                    titulo: `Clase ${elegida.claseNombre}`,
                    adultos: pasajeros.adultos,
                    ninos: pasajeros.ninos,
                    asientos,
                  }}
                  onCambio={cambiarAsientos}
                  ocupado={agregando}
                />
              </section>
            )}

            {imagenes.length > 1 && (
              <section>
                <h2 className="detalle-subtitulo">Conocé {vuelo.destinoCiudad}</h2>
                <GaleriaFotos imagenes={imagenes} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
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
                      {pasajeros[t.clave]} {pasajeros[t.clave] === 1 ? t.singular : t.titulo.toLowerCase()}
                      {precioPara(t) > 0 && ` × ${precioOGratis(precioPara(t))}`}
                    </span>
                    <strong>{precioOGratis(precioPara(t) * pasajeros[t.clave])}</strong>
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
                  <>
                    <button
                      className="boton boton-primario boton-ancho"
                      onClick={() => agregarAlCarrito(eligiendoIda)}
                      disabled={agregando || (estaLogueado && faltanAsientos > 0)}
                    >
                      {agregando
                        ? 'Agregando…'
                        : !estaLogueado
                          ? 'Iniciá sesión para comprar'
                          : faltanAsientos > 0
                            ? `Elegí ${faltanAsientos === 1 ? '1 asiento más' : `${faltanAsientos} asientos más`}`
                            : eligiendoIda
                              ? 'Agregar y elegir vuelo de vuelta →'
                              : 'Agregar al carrito'}
                    </button>
                    {eligiendoIda && estaLogueado && faltanAsientos <= 0 && (
                      <button
                        type="button"
                        className="boton boton-secundario boton-ancho"
                        onClick={() => agregarAlCarrito(false)}
                        disabled={agregando}
                      >
                        Agregar solo este vuelo
                      </button>
                    )}
                  </>
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