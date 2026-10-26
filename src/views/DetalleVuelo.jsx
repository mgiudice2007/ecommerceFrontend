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
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { estaLogueado, esComprador, esAdmin, actualizarCarrito } = useAuth()
  const [clases, setClases] = useState([])

  useEffect(() => {
    api('/api/clases')
      .then((data) => setClases(data))
      .catch(() => setClases([]))
  }, [])

  const [vuelo, setVuelo] = useState(null)
  const [imagenes, setImagenes] = useState([])
  const [error, setError] = useState('')

  const [elegida, setElegida] = useState(null)
  const [pasajeros, setPasajeros] = useState(leerPasajeros(searchParams))
  const [claseInicial] = useState(searchParams.get('clase'))
  const [asientos, setAsientos] = useState(searchParams.get('asientos') ? searchParams.get('asientos').split(',') : [])
  const [agregando, setAgregando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    api(`/api/vuelos/${id}`)
      .then((data) => {
        setVuelo(data)
        const deLaUrl = data.disponibilidades.find((d) => String(d.id) === claseInicial && d.hayStock)
        setElegida(deLaUrl ?? data.disponibilidades.find((d) => d.hayStock) ?? null)
      })
      .catch((err) => setError(err.message))

    api(`/api/fotos?vueloId=${id}`)
      .then((fotos) => Promise.all(fotos.map((foto) => pedirImagen(foto.id))))
      .then((data) => setImagenes(data))
      .catch(() => setImagenes([]))
  }, [id, claseInicial])

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
  const sePuedeComprar = estaOperativo(vuelo) && !yaSalio && vuelo.hayStock
  const descuento = textoDescuento(vuelo.descuentoVigente, precio)

  const elegirClase = (disponibilidad) => {
    setElegida(disponibilidad)
    setAsientos([])
    setMensaje(null)
  }

  const cambiarPasajeros = (nuevos) => {
    setPasajeros(nuevos)
    setAsientos(asientos.slice(0, nuevos.adultos + nuevos.ninos))
    setMensaje(null)
  }

  const cambiarAsientos = (nuevos) => {
    setAsientos(nuevos)
    setMensaje(null)
  }

  const necesitanAsiento = pasajeros.adultos + pasajeros.ninos
  const faltanAsientos = necesitanAsiento - asientos.length
  const agregado = mensaje?.tipo === 'exito'

  const precioPara = (tipo) => (elegida.precioConDescuento * tipo.porcentaje) / 100
  let total = 0
  if (elegida) {
    TIPOS_PASAJERO.forEach((t) => {
      total = total + precioPara(t) * pasajeros[t.clave]
    })
  }

  const eligiendoIda = searchParams.get('viaje') === 'idavuelta' && searchParams.get('tramo') === 'ida'

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
      const params = new URLSearchParams()
      params.set('adultos', pasajeros.adultos)
      params.set('ninos', pasajeros.ninos)
      params.set('bebes', pasajeros.bebes)
      if (elegida) params.set('clase', elegida.id)
      if (asientos.length > 0) params.set('asientos', asientos.join(','))
      for (const clave of ['viaje', 'origen', 'destino', 'ida', 'vuelta', 'tramo']) {
        if (searchParams.get(clave)) params.set(clave, searchParams.get(clave))
      }
      navigate('/login', { state: { desde: `${location.pathname}?${params.toString()}` } })
      return
    }

    setAgregando(true)
    setMensaje(null)
    api('/api/carrito/pasajes', {
      method: 'POST',
      body: { disponibilidadId: elegida.id, ...pasajeros, asientos },
    })
      .then((carrito) => {
        actualizarCarrito(carrito)
        if (seguirConVuelta) {
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

  const fondoPortada = imagenes.length > 0 ? { backgroundImage: `url("${imagenes[0]}")` } : undefined

  return (
    <>
      {esAdmin && (
        <div className="detalle-vista-admin">
          <div className="contenedor">
            <span>
              👁 Estás viendo este vuelo <strong>como lo ve un comprador</strong>. Es solo para mirar: como
              administrador no podés comprar.
            </span>
            <Link to={`/panel/vuelos/${vuelo.id}`} className="boton boton-claro">
              ← Volver a gestionar el vuelo
            </Link>
          </div>
        </div>
      )}

      <section className="detalle-portada" style={fondoPortada}>
        <div className="contenedor">
          <nav className="detalle-migas">
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

            {sePuedeComprar && elegida && !agregado && (
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

                {agregado ? (
                  <>
                    <Link to="/carrito" className="boton boton-primario boton-ancho">
                      Ir al carrito →
                    </Link>
                    <button
                      type="button"
                      className="boton boton-secundario boton-ancho detalle-ir-carrito"
                      onClick={() => setMensaje(null)}
                    >
                      Agregar otros pasajeros a este vuelo
                    </button>
                  </>
                ) : estaLogueado && !esComprador ? (
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

              </>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}

export default DetalleVuelo
