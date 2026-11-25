import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { agregarPasajes, reiniciarAgregado } from '../redux/carritoSlice'
import { fetchFotosVuelo, fetchMapaAsientos, fetchVuelo } from '../redux/vuelosSlice'
import { leerPasajeros, textoPasajeros } from '../utils/pasajeros'
import { urlParaElegirVuelta, urlTrasLogin } from '../utils/viaje'
import { motivoSinVenta } from '../utils/vuelos'
import './DetalleVuelo.css'

function DetalleVuelo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { estaLogueado, esComprador, esAdmin } = useAuth()
  const dispatch = useDispatch()
  const { clases } = useSelector((state) => state.catalogo)
  const { vueloActual, fotosVuelo, mapaAsientos, errorMapa, error } = useSelector((state) => state.vuelos)
  const { pasajesAgregados, guardando: agregando, error: errorAlAgregar } = useSelector((state) => state.carrito)

  // El store guarda el último vuelo que se pidió: solo sirve si es el de esta página
  const vuelo = vueloActual?.id === Number(id) ? vueloActual : null
  const imagenes = fotosVuelo.vueloId === Number(id) ? fotosVuelo.lista.map((foto) => foto.imagen) : []

  const [claseElegidaId, setClaseElegidaId] = useState(null)
  const [pasajeros, setPasajeros] = useState(leerPasajeros(searchParams))
  const [claseInicial] = useState(searchParams.get('clase'))
  const [asientos, setAsientos] = useState(searchParams.get('asientos') ? searchParams.get('asientos').split(',') : [])
  // Lo que se pidió agregar, para el aviso, y si después hay que seguir con el vuelo de vuelta
  const [textoAgregado, setTextoAgregado] = useState('')
  const [seguirConVuelta, setSeguirConVuelta] = useState(false)

  useEffect(() => {
    dispatch(reiniciarAgregado())
    dispatch(fetchVuelo(id))
    dispatch(fetchFotosVuelo(Number(id)))
  }, [id, dispatch])

  // Cuando el backend confirma los pasajes y hay que elegir la vuelta, se sigue a la búsqueda de la vuelta
  useEffect(() => {
    if (pasajesAgregados && seguirConVuelta) {
      dispatch(reiniciarAgregado())
      navigate(urlParaElegirVuelta(searchParams, pasajeros))
    }
  }, [pasajesAgregados, seguirConVuelta, dispatch, navigate, searchParams, pasajeros])

  // La clase elegida es la que tocó el usuario; si no tocó ninguna, la de la URL o la primera con lugar
  const disponibilidades = vuelo?.disponibilidades ?? []
  const claseDeLaUrl = disponibilidades.find((d) => String(d.id) === claseInicial && d.hayStock)
  const elegida =
    disponibilidades.find((d) => d.id === claseElegidaId) ?? claseDeLaUrl ?? disponibilidades.find((d) => d.hayStock) ?? null

  const elegidaId = elegida?.id

  useEffect(() => {
    if (elegidaId) {
      dispatch(fetchMapaAsientos(elegidaId))
    }
  }, [elegidaId, dispatch])

  if (error && !vuelo) {
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
  const mapaDeLaClase = elegida && mapaAsientos.disponibilidadId === elegida.id
  const faltanAsientos = pasajeros.adultos + pasajeros.ninos - asientos.length
  const agregado = pasajesAgregados && !seguirConVuelta
  const eligiendoIda = searchParams.get('viaje') === 'idavuelta' && searchParams.get('tramo') === 'ida'

  const elegirClase = (disponibilidad) => {
    setClaseElegidaId(disponibilidad.id)
    setAsientos([])
    dispatch(reiniciarAgregado())
  }

  const cambiarPasajeros = (nuevos) => {
    setPasajeros(nuevos)
    setAsientos(asientos.slice(0, nuevos.adultos + nuevos.ninos))
    dispatch(reiniciarAgregado())
  }

  const cambiarAsientos = (nuevos) => {
    setAsientos(nuevos)
    dispatch(reiniciarAgregado())
  }

  const agregarAlCarrito = (irAVuelta = false) => {
    if (!estaLogueado) {
      const desde = urlTrasLogin(location.pathname, searchParams, pasajeros, elegida?.id, asientos)
      navigate('/login', { state: { desde } })
      return
    }

    setSeguirConVuelta(irAVuelta)
    setTextoAgregado(
      `Agregaste ${textoPasajeros(pasajeros)} en ${elegida.claseNombre} al carrito (asientos ${asientos.join(', ')}).`,
    )
    dispatch(agregarPasajes({ disponibilidadId: elegida.id, ...pasajeros, asientos }))
  }

  const agregarOtros = () => {
    setAsientos([])
    dispatch(reiniciarAgregado())
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
                mapa={mapaDeLaClase ? mapaAsientos.datos : null}
                error={mapaDeLaClase ? '' : (errorMapa ?? '')}
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

            {agregado && <Mensaje tipo="exito">{textoAgregado}</Mensaje>}
            {errorAlAgregar && <Mensaje>{errorAlAgregar}</Mensaje>}

            <AccionesCompra
              agregado={agregado}
              estaLogueado={estaLogueado}
              esComprador={esComprador}
              agregando={agregando}
              faltanAsientos={faltanAsientos}
              eligiendoIda={eligiendoIda}
              onAgregar={agregarAlCarrito}
              onAgregarOtros={agregarOtros}
            />
          </PanelCompra>
        </div>
      </div>
    </>
  )
}

export default DetalleVuelo
