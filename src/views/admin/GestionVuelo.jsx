import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FormClase from '../../components/admin/FormClase'
import FormDatosVuelo from '../../components/admin/FormDatosVuelo'
import FormDescuento from '../../components/admin/FormDescuento'
import GrillaFotos from '../../components/admin/GrillaFotos'
import PestaniasGestion from '../../components/admin/PestaniasGestion'
import SubirFoto from '../../components/admin/SubirFoto'
import TablaClases from '../../components/admin/TablaClases'
import TablaDescuentos from '../../components/admin/TablaDescuentos'
import Cargando from '../../components/comunes/Cargando'
import Mensaje from '../../components/comunes/Mensaje'
import { avisar } from '../../redux/avisosSlice'
import {
  alternarDescuento,
  crearDescuento,
  crearDisponibilidad,
  editarDisponibilidad,
  editarVuelo,
  eliminarDescuento,
  eliminarDisponibilidad,
  eliminarFoto,
  fetchDescuentosVuelo,
  fetchFotosVuelo,
  fetchVuelo,
  limpiarMensaje,
  reiniciarGuardado,
  subirFoto,
} from '../../redux/vuelosSlice'
import { fechaLarga, hora } from '../../utils/formato'
import { cuerpoVuelo } from '../../utils/vuelos'
import './Panel.css'
import './GestionVuelo.css'

const PESTANIAS = [
  { id: 'datos', titulo: 'Datos del vuelo' },
  { id: 'clases', titulo: 'Clases y asientos' },
  { id: 'descuentos', titulo: 'Descuentos' },
  { id: 'fotos', titulo: 'Fotos' },
]

const MAXIMO_FOTOS = 5

function GestionVuelo() {
  const { id } = useParams()
  const vueloId = Number(id)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { clases, aeropuertos, categorias } = useSelector((state) => state.catalogo)
  const { vueloActual, fotosVuelo, descuentosVuelo, vueloGuardado, mensaje, guardando, error } = useSelector(
    (state) => state.vuelos,
  )

  // El store guarda el último vuelo, fotos y descuentos que se pidieron: solo sirven si son de este vuelo
  const vuelo = vueloActual?.id === vueloId ? vueloActual : null
  const fotos = fotosVuelo.vueloId === vueloId ? fotosVuelo.lista : []
  const descuentos = descuentosVuelo.vueloId === vueloId ? descuentosVuelo.lista : []

  const [pestania, setPestania] = useState(location.state?.recienCreado ? 'clases' : 'datos')
  // Avisos de los formularios (por ejemplo, fechas sin completar): lo que responde el backend sale de `error` y `mensaje`
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    dispatch(reiniciarGuardado())
    dispatch(fetchVuelo(vueloId))
    dispatch(fetchFotosVuelo(vueloId))
    dispatch(fetchDescuentosVuelo(vueloId))
  }, [vueloId, dispatch])

  // Cuando el backend confirma un cambio de clases, descuentos o fotos, su mensaje sale como aviso flotante
  useEffect(() => {
    if (mensaje) {
      dispatch(avisar(mensaje))
      dispatch(limpiarMensaje())
    }
  }, [mensaje, dispatch])

  // Cuando el backend confirma que se guardaron los datos del vuelo, se avisa y se vuelve al panel
  useEffect(() => {
    if (vueloGuardado) {
      dispatch(avisar(`Se guardaron los cambios del vuelo ${vueloGuardado.numeroVuelo}.`))
      dispatch(reiniciarGuardado())
      navigate('/panel')
    }
  }, [vueloGuardado, dispatch, navigate])

  const elegirPestania = (nueva) => {
    setPestania(nueva)
    setAviso(null)
  }

  const mostrarError = (texto) => setAviso(texto ? { tipo: 'error', texto } : null)

  const despachar = (accion) => {
    setAviso(null)
    dispatch(accion)
  }

  if (error && !vuelo) {
    return (
      <div className="contenedor pagina">
        <Mensaje>{error}</Mensaje>
        <Link to="/panel">← Volver al panel</Link>
      </div>
    )
  }

  if (!vuelo) {
    return <Cargando pagina texto="Cargando vuelo…" />
  }

  return (
    <>
      <EncabezadoPagina
        imagen={fotos[0]?.imagen}
        etiqueta={`Vuelo ${vuelo.numeroVuelo} · ${vuelo.categoriaNombre}`}
        titulo={`${vuelo.origenCiudad} → ${vuelo.destinoCiudad}`}
        subtitulo={`${vuelo.origenIata} → ${vuelo.destinoIata} · Sale el ${fechaLarga(vuelo.fechaSalida)} a las ${hora(vuelo.fechaSalida)} hs`}
        acciones={
          <Link
            to={`/vuelos/${vuelo.id}`}
            className="boton boton-contorno"
            title="Abre la página del vuelo tal como la ve un pasajero. Es solo para mirar."
          >
            👁 Ver vista del comprador
          </Link>
        }
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        {location.state?.recienCreado && (
          <Mensaje tipo="exito">
            ¡Vuelo publicado! Ahora cargale al menos una clase con asientos para que se pueda comprar, y sus fotos desde
            la pestaña Fotos.
          </Mensaje>
        )}

        <PestaniasGestion pestanias={PESTANIAS} activa={pestania} onElegir={elegirPestania} />

        {aviso && <Mensaje tipo={aviso.tipo}>{aviso.texto}</Mensaje>}
        {error && <Mensaje>{error}</Mensaje>}

        {pestania === 'datos' && (
          <FormDatosVuelo
            vuelo={vuelo}
            aeropuertos={aeropuertos}
            categorias={categorias}
            guardando={guardando}
            onGuardar={(formData) => despachar(editarVuelo({ id: vuelo.id, vuelo: cuerpoVuelo(formData) }))}
          />
        )}

        {pestania === 'clases' && (
          <div className="gestion-seccion">
            <TablaClases
              vuelo={vuelo}
              clases={clases}
              guardando={guardando}
              onGuardar={(disponibilidad, valores) =>
                despachar(editarDisponibilidad({ vueloId: vuelo.id, disponibilidad, valores }))
              }
              onEliminar={(disponibilidad) => despachar(eliminarDisponibilidad(disponibilidad))}
            />
            <FormClase
              key={vuelo.disponibilidades.length}
              vuelo={vuelo}
              clases={clases}
              guardando={guardando}
              onAgregar={(clase) => despachar(crearDisponibilidad({ vueloId: vuelo.id, clase }))}
            />
          </div>
        )}

        {pestania === 'descuentos' && (
          <div className="gestion-seccion">
            <TablaDescuentos
              descuentos={descuentos}
              guardando={guardando}
              onAlternar={(descuento) => despachar(alternarDescuento({ vueloId: vuelo.id, descuento }))}
              onEliminar={(descuento) => despachar(eliminarDescuento(descuento))}
            />
            <FormDescuento
              key={descuentos.length}
              diaDelVuelo={vuelo.fechaSalida.slice(0, 10)}
              guardando={guardando}
              onCrear={(descuento) => despachar(crearDescuento({ vueloId: vuelo.id, descuento }))}
              onError={mostrarError}
            />
          </div>
        )}

        {pestania === 'fotos' && (
          <div className="gestion-seccion">
            <GrillaFotos
              fotos={fotos}
              imagenes={fotos.map((foto) => foto.imagen)}
              maximo={MAXIMO_FOTOS}
              onEliminar={(foto) => despachar(eliminarFoto(foto))}
            />
            <SubirFoto
              key={fotos.length}
              lleno={fotos.length >= MAXIMO_FOTOS}
              maximo={MAXIMO_FOTOS}
              subiendo={guardando}
              onSubir={(archivo) => despachar(subirFoto({ vueloId: vuelo.id, archivo }))}
              onError={mostrarError}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default GestionVuelo
