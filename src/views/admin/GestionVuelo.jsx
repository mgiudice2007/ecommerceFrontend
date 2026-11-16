import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/api'
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
import { useCatalogo } from '../../hooks/useCatalogo'
import { useDescuentosVuelo } from '../../hooks/useDescuentosVuelo'
import { useDisponibilidades } from '../../hooks/useDisponibilidades'
import { useFotosVuelo } from '../../hooks/useFotosVuelo'
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

  const [vuelo, setVuelo] = useState(null)
  const [error, setError] = useState('')
  const [pestania, setPestania] = useState(location.state?.recienCreado ? 'clases' : 'datos')
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [recargar, setRecargar] = useState(0)

  const avisar = (tipo, texto) => setAviso(tipo ? { tipo, texto } : null)
  const recargarVuelo = () => setRecargar((veces) => veces + 1)
  const opciones = { avisar, onCambio: recargarVuelo }

  const clases = useCatalogo('/api/clases')
  const aeropuertos = useCatalogo('/api/aeropuertos')
  const categorias = useCatalogo('/api/categorias')
  const disponibilidades = useDisponibilidades(vuelo, opciones)
  const descuentos = useDescuentosVuelo(vueloId, opciones)
  const fotos = useFotosVuelo(vueloId, opciones)

  useEffect(() => {
    api(`/api/vuelos/${id}`)
      .then((data) => setVuelo(data))
      .catch((err) => setError(err.message))
  }, [id, recargar])

  const elegirPestania = (nueva) => {
    setPestania(nueva)
    setAviso(null)
  }

  const guardarDatos = (formData) => {
    setGuardando(true)
    avisar(null)
    api(`/api/vuelos/${vuelo.id}`, { method: 'PUT', body: cuerpoVuelo(formData) })
      .then((actualizado) =>
        navigate('/panel', { state: { mensaje: `Se guardaron los cambios del vuelo ${actualizado.numeroVuelo}.` } }),
      )
      .catch((err) => {
        avisar('error', err.message)
        setGuardando(false)
      })
  }

  if (error) {
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
        imagen={fotos.imagenes[0]}
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

        {pestania === 'datos' && (
          <FormDatosVuelo
            vuelo={vuelo}
            aeropuertos={aeropuertos}
            categorias={categorias}
            guardando={guardando}
            onGuardar={guardarDatos}
          />
        )}

        {pestania === 'clases' && (
          <div className="gestion-seccion">
            <TablaClases
              vuelo={vuelo}
              clases={clases}
              guardando={disponibilidades.guardando}
              onGuardar={disponibilidades.guardar}
              onEliminar={disponibilidades.eliminar}
            />
            <FormClase
              vuelo={vuelo}
              clases={clases}
              guardando={disponibilidades.guardando}
              onAgregar={disponibilidades.agregar}
            />
          </div>
        )}

        {pestania === 'descuentos' && (
          <div className="gestion-seccion">
            <TablaDescuentos
              descuentos={descuentos.descuentos}
              guardando={descuentos.guardando}
              onAlternar={descuentos.alternarActivo}
              onEliminar={descuentos.eliminar}
            />
            <FormDescuento
              diaDelVuelo={vuelo.fechaSalida.slice(0, 10)}
              guardando={descuentos.guardando}
              onCrear={descuentos.crear}
              onError={(texto) => avisar('error', texto)}
            />
          </div>
        )}

        {pestania === 'fotos' && (
          <div className="gestion-seccion">
            <GrillaFotos
              fotos={fotos.fotos}
              imagenes={fotos.imagenes}
              maximo={MAXIMO_FOTOS}
              onEliminar={fotos.eliminar}
            />
            <SubirFoto
              lleno={fotos.fotos.length >= MAXIMO_FOTOS}
              maximo={MAXIMO_FOTOS}
              subiendo={fotos.subiendo}
              onSubir={fotos.subir}
              onError={(texto) => avisar(texto ? 'error' : null, texto)}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default GestionVuelo
