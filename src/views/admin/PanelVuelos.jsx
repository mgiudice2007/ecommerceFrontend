import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Confirmacion from '../../components/Confirmacion'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FilaVueloPanel from '../../components/admin/FilaVueloPanel'
import Campo from '../../components/comunes/Campo'
import Cargando from '../../components/comunes/Cargando'
import EstadoVacio from '../../components/comunes/EstadoVacio'
import GrillaNumeros from '../../components/comunes/GrillaNumeros'
import Mensaje from '../../components/comunes/Mensaje'
import Paginador from '../../components/comunes/Paginador'
import { avisar } from '../../redux/avisosSlice'
import {
  cambiarEstadoVuelo,
  fetchResumenPanel,
  fetchVuelosPanel,
  limpiarMensaje,
} from '../../redux/vuelosSlice'
import { textoEstado } from '../../utils/vuelos'
import './Panel.css'

function PanelVuelos() {
  const dispatch = useDispatch()
  const { vuelosPanel, resumenPanel: resumen, mensaje, loading, error } = useSelector((state) => state.vuelos)

  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [aEliminar, setAEliminar] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState(null)

  const texto = busqueda.trim()
  // La lista guardada en el store es la de la última página y búsqueda que se pidieron: hasta que llegue la de ahora, se espera
  const esDeEstaPagina = vuelosPanel.pagina === pagina && vuelosPanel.texto === texto
  const cargando = loading || !esDeEstaPagina
  const vuelos = esDeEstaPagina ? (vuelosPanel.datos?.content ?? []) : []
  const totalPaginas = esDeEstaPagina ? (vuelosPanel.datos?.totalPages ?? 0) : 0

  useEffect(() => {
    dispatch(fetchResumenPanel())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchVuelosPanel({ pagina, texto }))
  }, [pagina, texto, dispatch])

  // El backend responde con un mensaje al cambiar el estado de un vuelo: se muestra como aviso y se limpia del store
  useEffect(() => {
    if (mensaje) {
      dispatch(avisar(mensaje))
      dispatch(limpiarMensaje())
    }
  }, [mensaje, dispatch])

  const cambiarEstado = (vuelo, estado) => dispatch(cambiarEstadoVuelo({ id: vuelo.id, estado }))

  const eliminar = (vuelo) => {
    setAEliminar(null)
    cambiarEstado(vuelo, 'ELIMINADO')
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Torre de control · Administrador"
        titulo="Vuelos de la aerolínea"
        subtitulo="Publicá vuelos y manejá su estado, asientos, promociones y fotos."
        acciones={
          <>
            <Link to="/panel/embarque" className="boton boton-contorno">
              Validar embarque
            </Link>
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
