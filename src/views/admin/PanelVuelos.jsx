import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FotoVuelo from '../../components/FotoVuelo'
import { fechaCorta, hora, precio } from '../../utils/formato'
import { ESTADOS_VUELO, textoDescuento, textoEstado } from '../../utils/vuelos'
import './Panel.css'

const POR_PAGINA = 20

const asientosDe = (vuelo) =>
  vuelo.disponibilidades.reduce(
    (cuenta, d) => ({
      totales: cuenta.totales + d.asientosTotales,
      vendidos: cuenta.vendidos + (d.asientosTotales - d.asientosDisponibles),
    }),
    { totales: 0, vendidos: 0 },
  )

function PanelVuelos() {
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(0)
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null })
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')
  const location = useLocation()
  const [mensaje, setMensaje] = useState(location.state?.mensaje ?? '')
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
    setMensaje('')
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
        setMensaje(respuesta.mensaje)
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
          <div className="panel-numeros">
            <div className="tarjeta">
              <small>Vuelos publicados</small>
              <strong>{resumen.vuelos}</strong>
            </div>
            <div className="tarjeta">
              <small>Asientos vendidos</small>
              <strong>{resumen.asientosVendidos}</strong>
            </div>
            <div className="tarjeta">
              <small>Asientos cargados</small>
              <strong>{resumen.asientosTotales}</strong>
            </div>
          </div>
        )}

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {mensaje && <div className="mensaje mensaje-exito">{mensaje}</div>}
        {resumen?.vuelos === 0 && (
          <div className="tarjeta panel-vacio">
            <h2>Todavía no publicaste vuelos</h2>
            <p className="texto-suave">Creá tu primer vuelo y después cargale las clases con asientos y precio.</p>
            <Link to="/panel/vuelos/nuevo" className="boton boton-primario">
              Publicar mi primer vuelo
            </Link>
          </div>
        )}

        {resumen?.vuelos > 0 && (
          <div className="campo panel-buscar">
            <label htmlFor="buscarVuelo">Buscar en el panel</label>
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
          </div>
        )}

        {cargando && !error && <p className="texto-suave">Cargando vuelos…</p>}
        {!cargando && texto && vuelos.length === 0 && (
          <p className="texto-suave">No hay vuelos que coincidan con "{texto}".</p>
        )}

        <div className="panel-lista">
          {vuelos.map((vuelo) => {
            const asientos = asientosDe(vuelo)
            const descuento = textoDescuento(vuelo.descuentoVigente, precio)
            const sinClases = vuelo.disponibilidades.length === 0

            return (
              <article key={vuelo.id} className="tarjeta panel-vuelo">
                <div className="panel-vuelo-foto" aria-hidden="true">
                  <FotoVuelo destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
                </div>
                <div className="panel-vuelo-info">
                  <div className="panel-vuelo-titulo">
                    <strong>
                      {vuelo.origenCiudad} → {vuelo.destinoCiudad}
                    </strong>
                    <span className="texto-suave">
                      Vuelo {vuelo.numeroVuelo} · {fechaCorta(vuelo.fechaSalida)} {hora(vuelo.fechaSalida)} hs
                    </span>
                  </div>
                  <div className="panel-vuelo-etiquetas">
                    <span className="etiqueta">{vuelo.categoriaNombre}</span>
                    {descuento && <span className="etiqueta etiqueta-exito">{descuento}</span>}
                    {sinClases && <span className="etiqueta etiqueta-aviso">Sin clases cargadas</span>}
                    {vuelo.estado !== 'ACTIVO' && (
                      <span className={`etiqueta estado-${vuelo.estado.toLowerCase()}`}>{textoEstado(vuelo.estado)}</span>
                    )}
                  </div>
                </div>

                <div className="panel-vuelo-asientos">
                  <small>Vendidos</small>
                  <strong>
                    {asientos.vendidos} / {asientos.totales}
                  </strong>
                </div>

                <div className="panel-vuelo-acciones">
                  <select
                    className="panel-vuelo-estado"
                    value={vuelo.estado}
                    onChange={(e) => setNuevoEstado({ vuelo, estado: e.target.value })}
                    aria-label={`Estado del vuelo ${vuelo.numeroVuelo}`}
                  >
                    {ESTADOS_VUELO.map((e) => (
                      <option key={e.valor} value={e.valor}>
                        {e.texto}
                      </option>
                    ))}
                  </select>
                  <Link to={`/panel/vuelos/${vuelo.id}`} className="boton boton-primario">
                    Gestionar
                  </Link>
                  <button className="boton boton-peligro" onClick={() => setAEliminar(vuelo)}>
                    Eliminar
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {totalPaginas > 1 && (
          <nav className="panel-paginas" aria-label="Páginas del panel">
            <button className="boton boton-secundario" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
              ← Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              className="boton boton-secundario"
              disabled={pagina + 1 >= totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}
      </div>

      {nuevoEstado && (
        <Confirmacion
          titulo={`¿Cambiar el vuelo ${nuevoEstado.vuelo.numeroVuelo} a ${textoEstado(nuevoEstado.estado)}?`}
          detalle={[`Estado: ${textoEstado(nuevoEstado.vuelo.estado)} → ${textoEstado(nuevoEstado.estado)}`]}
          textoConfirmar="Sí, cambiar"
          peligro={nuevoEstado.estado === 'CANCELADO'}
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
