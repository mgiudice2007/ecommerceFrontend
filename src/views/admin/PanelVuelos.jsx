import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FilaVueloPanel from '../../components/admin/FilaVueloPanel'
import Campo from '../../components/comunes/Campo'
import Cargando from '../../components/comunes/Cargando'
import EstadoVacio from '../../components/comunes/EstadoVacio'
import GrillaNumeros from '../../components/comunes/GrillaNumeros'
import Mensaje from '../../components/comunes/Mensaje'
import Paginador from '../../components/comunes/Paginador'
import { useAvisos } from '../../context/AvisosContext'
import { asientosDe, textoEstado } from '../../utils/vuelos'
import './Panel.css'

const POR_PAGINA = 20

function PanelVuelos() {
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null })
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')
  const { avisar } = useAvisos()
  const [aEliminar, setAEliminar] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState(null)

  const texto = busqueda.trim()
  const clave = `${pagina}|${texto}`
  const cargando = respuesta.clave !== clave
  const datos = cargando ? null : respuesta.datos
  const vuelos = datos?.content ?? []
  const totalPaginas = datos?.totalPages ?? 0

  useEffect(() => {
    api('/api/vuelos/resumen')
      .then((data) => setResumen(data))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ page: pagina, size: POR_PAGINA })
    if (texto) params.set('texto', texto)
    api(`/api/vuelos?${params.toString()}`)
      .then((data) => setRespuesta({ clave: `${pagina}|${texto}`, datos: data }))
      .catch((err) => setError(err.message))
  }, [pagina, texto])

  const cambiarLista = (nuevaLista, menos = 0) =>
    setRespuesta({
      clave: respuesta.clave,
      datos: { ...respuesta.datos, content: nuevaLista, totalElements: respuesta.datos.totalElements - menos },
    })

  const cambiarEstado = (vuelo, estado) => {
    setError('')
    api(`/api/vuelos/${vuelo.id}/estado`, { method: 'PATCH', body: { estado } })
      .then((respuesta) => {
        if (estado === 'ELIMINADO') {
          cambiarLista(
            vuelos.filter((v) => v.id !== vuelo.id),
            1,
          )
          const asientos = asientosDe(vuelo)
          setResumen({
            vuelos: resumen.vuelos - 1,
            asientosVendidos: resumen.asientosVendidos - asientos.vendidos,
            asientosTotales: resumen.asientosTotales - asientos.totales,
          })
        } else {
          cambiarLista(vuelos.map((v) => (v.id === vuelo.id ? { ...v, estado: respuesta.estado } : v)))
        }
        avisar(respuesta.mensaje)
      })
      .catch((err) => setError(err.message))
  }

  const eliminar = (vuelo) => {
    setAEliminar(null)
    cambiarEstado(vuelo, 'ELIMINADO')
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Administrador"
        titulo="Vuelos de la aerolínea"
        subtitulo="Publicá vuelos y manejá su estado, asientos, promociones y fotos."
        acciones={
          <>
            <Link to="/panel/usuarios" className="boton boton-contorno">
              Usuarios y permisos
            </Link>
            <Link to="/panel/vuelos/nuevo" className="boton boton-claro">
              + Publicar vuelo
            </Link>
          </>
        }
      />

      <div className="contenedor sobre-encabezado">
        {resumen && (
          <GrillaNumeros
            numeros={[
              { rotulo: 'Vuelos publicados', valor: resumen.vuelos },
              { rotulo: 'Asientos vendidos', valor: resumen.asientosVendidos },
              { rotulo: 'Asientos cargados', valor: resumen.asientosTotales },
            ]}
          />
        )}

        {error && <Mensaje>{error}</Mensaje>}
        {resumen?.vuelos === 0 && (
          <EstadoVacio
            titulo="Todavía no publicaste vuelos"
            texto="Creá tu primer vuelo y después cargale las clases con asientos y precio."
          >
            <Link to="/panel/vuelos/nuevo" className="boton boton-primario">
              Publicar mi primer vuelo
            </Link>
          </EstadoVacio>
        )}

        {resumen?.vuelos > 0 && (
          <Campo id="buscarVuelo" etiqueta="Buscar en el panel" className="panel-buscar">
            <input
              id="buscarVuelo"
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(0)
              }}
              placeholder="Ciudad, código de aeropuerto o número de vuelo"
            />
          </Campo>
        )}

        {cargando && !error && <Cargando texto="Cargando vuelos…" />}
        {!cargando && texto && vuelos.length === 0 && (
          <p className="texto-suave">No hay vuelos que coincidan con "{texto}".</p>
        )}

        <div className="panel-lista">
          {vuelos.map((vuelo) => (
            <FilaVueloPanel
              key={vuelo.id}
              vuelo={vuelo}
              onCambiarEstado={(v, estado) =>
                estado === 'CANCELADO' ? setNuevoEstado({ vuelo: v, estado }) : cambiarEstado(v, estado)
              }
              onEliminar={setAEliminar}
            />
          ))}
        </div>

        <Paginador pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} etiqueta="Páginas del panel" />
      </div>

      {nuevoEstado && (
        <Confirmacion
          titulo={`¿Cancelar el vuelo ${nuevoEstado.vuelo.numeroVuelo}?`}
          detalle={[`Estado: ${textoEstado(nuevoEstado.vuelo.estado)} → ${textoEstado(nuevoEstado.estado)}`]}
          textoConfirmar="Sí, cancelar vuelo"
          peligro
          onConfirmar={() => {
            cambiarEstado(nuevoEstado.vuelo, nuevoEstado.estado)
            setNuevoEstado(null)
          }}
          onCancelar={() => setNuevoEstado(null)}
        />
      )}

      {aEliminar && (
        <Confirmacion
          titulo={`¿Eliminar el vuelo ${aEliminar.numeroVuelo}?`}
          mensaje="Deja de mostrarse en la búsqueda. Las compras ya hechas no se modifican."
          textoConfirmar="Sí, eliminar"
          peligro
          onConfirmar={() => eliminar(aEliminar)}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </>
  )
}

export default PanelVuelos
