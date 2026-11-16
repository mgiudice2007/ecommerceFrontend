import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, pedirImagen } from '../api/api'
import GaleriaFotos from '../components/GaleriaFotos'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import AccionesCompra from '../components/detalle/AccionesCompra'
import AvisoVistaAdmin from '../components/detalle/AvisoVistaAdmin'
import ElegirAsientos from '../components/detalle/ElegirAsientos'
import Itinerario from '../components/detalle/Itinerario'
import ListaClases from '../components/detalle/ListaClases'
import PanelCompra from '../components/detalle/PanelCompra'
import PortadaVuelo from '../components/detalle/PortadaVuelo'
import ResumenSeleccion from '../components/detalle/ResumenSeleccion'
import { useAuth } from '../context/AuthContext'
import { leerPasajeros, textoPasajeros } from '../utils/pasajeros'
import { urlParaElegirVuelta, urlTrasLogin } from '../utils/viaje'
import { motivoSinVenta } from '../utils/vuelos'
import { useCatalogo } from '../hooks/useCatalogo'
import './DetalleVuelo.css'

function DetalleVuelo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { estaLogueado, esComprador, esAdmin, actualizarCarrito } = useAuth()
  const clases = useCatalogo('/api/clases')

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
        <Mensaje>{error}</Mensaje>
        <Link to="/">← Volver al inicio</Link>
      </div>
    )
  }

  if (!vuelo) {
    return <Cargando pagina texto="Cargando vuelo…" />
  }

  const sinVenta = motivoSinVenta(vuelo)
  const mapaDeLaClase = elegida && mapa.disponibilidadId === elegida.id
  const faltanAsientos = pasajeros.adultos + pasajeros.ninos - asientos.length
  const agregado = mensaje?.tipo === 'exito'
  const eligiendoIda = searchParams.get('viaje') === 'idavuelta' && searchParams.get('tramo') === 'ida'

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

  const agregarAlCarrito = (seguirConVuelta = false) => {
    if (!estaLogueado) {
      const desde = urlTrasLogin(location.pathname, searchParams, pasajeros, elegida?.id, asientos)
      navigate('/login', { state: { desde } })
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
          navigate(urlParaElegirVuelta(searchParams, pasajeros))
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

  return (
    <>
      {esAdmin && <AvisoVistaAdmin vueloId={vuelo.id} />}

      <PortadaVuelo vuelo={vuelo} imagen={imagenes[0]} />

      <div className="contenedor detalle-cuerpo">
        <div className="detalle-layout">
          <div className="detalle-principal">
            <Itinerario vuelo={vuelo} />

            <ListaClases
              disponibilidades={vuelo.disponibilidades}
              clases={clases}
              elegida={elegida}
              onElegir={elegirClase}
            />

            {!sinVenta && elegida && !agregado && (
              <ElegirAsientos
                clase={elegida}
                pasajeros={pasajeros}
                asientos={asientos}
                mapa={mapaDeLaClase ? mapa.datos : null}
                error={mapaDeLaClase ? mapa.error : ''}
                ocupado={agregando}
                onCambio={cambiarAsientos}
              />
            )}

            {imagenes.length > 1 && (
              <section>
                <h2 className="detalle-subtitulo">Conocé {vuelo.destinoCiudad}</h2>
                <GaleriaFotos imagenes={imagenes} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
              </section>
            )}
          </div>

          <PanelCompra motivoSinVenta={sinVenta} hayClase={elegida !== null}>
            <ResumenSeleccion clase={elegida} pasajeros={pasajeros} onCambiarPasajeros={cambiarPasajeros} />

            {mensaje && <Mensaje tipo={mensaje.tipo}>{mensaje.texto}</Mensaje>}

            <AccionesCompra
              agregado={agregado}
              estaLogueado={estaLogueado}
              esComprador={esComprador}
              agregando={agregando}
              faltanAsientos={faltanAsientos}
              eligiendoIda={eligiendoIda}
              onAgregar={agregarAlCarrito}
              onAgregarOtros={() => setMensaje(null)}
            />
          </PanelCompra>
        </div>
      </div>
    </>
  )
}

export default DetalleVuelo
