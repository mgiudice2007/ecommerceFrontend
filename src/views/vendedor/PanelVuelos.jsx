import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FotoVuelo from '../../components/FotoVuelo'
import { fechaCorta, hora, precio } from '../../utils/formato'
import { ESTADOS_VUELO, textoDescuento, textoEstado } from '../../utils/vuelos'
import './Panel.css'

// Cuenta asientos totales y vendidos sumando todas las clases del vuelo
const asientosDe = (vuelo) =>
  vuelo.disponibilidades.reduce(
    (cuenta, d) => ({
      totales: cuenta.totales + d.asientosTotales,
      vendidos: cuenta.vendidos + (d.asientosTotales - d.asientosDisponibles),
    }),
    { totales: 0, vendidos: 0 },
  )

function PanelVuelos() {
  const [vuelos, setVuelos] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    // El admin es el unico vendedor de la aerolinea: ve y maneja todos los vuelos
    api('/api/vuelos')
      .then((pagina) => setVuelos(pagina.content))
      .catch((err) => setError(err.message))
  }, [])

  // PATCH /api/vuelos/:id/estado cambia solo el estado del vuelo (activo, demorado,
  // pausado, cancelado o eliminado) y devuelve { id, estado, mensaje }.
  const cambiarEstado = async (vuelo, estado) => {
    setError('')
    setMensaje('')
    try {
      const respuesta = await api(`/api/vuelos/${vuelo.id}/estado`, { method: 'PATCH', body: { estado } })
      setVuelos(
        estado === 'ELIMINADO'
          ? vuelos.filter((v) => v.id !== vuelo.id) // la baja logica lo saca del listado
          : vuelos.map((v) => (v.id === vuelo.id ? { ...v, estado: respuesta.estado } : v)),
      )
      setMensaje(respuesta.mensaje) // por ejemplo "El vuelo BC1402 fue marcado como demorado"
    } catch (err) {
      setError(err.message)
    }
  }

  const eliminar = (vuelo) => {
    const seguro = window.confirm(
      `¿Eliminar el vuelo ${vuelo.numeroVuelo}? Deja de mostrarse en la búsqueda. Las compras ya hechas no se modifican.`,
    )
    if (seguro) cambiarEstado(vuelo, 'ELIMINADO')
  }

  // Filtro de la lista por texto (solo en el navegador, no vuelve a pedir al backend)
  const texto = busqueda.trim().toLowerCase()
  const visibles = (vuelos ?? []).filter((v) =>
    `${v.origenCiudad} ${v.destinoCiudad} ${v.origenIata} ${v.destinoIata} ${v.numeroVuelo}`
      .toLowerCase()
      .includes(texto),
  )

  const resumen = (vuelos ?? []).reduce(
    (total, vuelo) => {
      const asientos = asientosDe(vuelo)
      return { totales: total.totales + asientos.totales, vendidos: total.vendidos + asientos.vendidos }
    },
    { totales: 0, vendidos: 0 },
  )

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
        {vuelos && (
          <div className="panel-numeros">
            <div className="tarjeta">
              <small>Vuelos publicados</small>
              <strong>{vuelos.length}</strong>
            </div>
            <div className="tarjeta">
              <small>Asientos vendidos</small>
              <strong>{resumen.vendidos}</strong>
            </div>
            <div className="tarjeta">
              <small>Asientos cargados</small>
              <strong>{resumen.totales}</strong>
            </div>
          </div>
        )}

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {mensaje && <div className="mensaje mensaje-exito">{mensaje}</div>}
        {!vuelos && !error && <p className="texto-suave">Cargando vuelos…</p>}

        {vuelos?.length === 0 && (
          <div className="tarjeta panel-vacio">
            <h2>Todavía no publicaste vuelos</h2>
            <p className="texto-suave">Creá tu primer vuelo y después cargale las clases con asientos y precio.</p>
            <Link to="/panel/vuelos/nuevo" className="boton boton-primario">
              Publicar mi primer vuelo
            </Link>
          </div>
        )}

        {vuelos?.length > 0 && (
          <div className="campo panel-buscar">
            <label htmlFor="buscarVuelo">Buscar en el panel</label>
            <input
              id="buscarVuelo"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ciudad, código de aeropuerto o número de vuelo"
            />
          </div>
        )}

        <div className="panel-lista">
          {visibles.map((vuelo) => {
            const asientos = asientosDe(vuelo)
            const descuento = textoDescuento(vuelo.descuentoVigente, precio)
            const sinClases = vuelo.disponibilidades.length === 0

            return (
              <article key={vuelo.id} className="tarjeta panel-vuelo">
                <div className="panel-vuelo-foto" aria-hidden="true">
                  <FotoVuelo vueloId={vuelo.id} destinoIata={vuelo.destinoIata} destinoCiudad={vuelo.destinoCiudad} />
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
                    onChange={(e) => cambiarEstado(vuelo, e.target.value)}
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
                  <Link to={`/panel/vuelos/${vuelo.id}/editar`} className="boton boton-secundario">
                    Editar
                  </Link>
                  <button className="boton boton-peligro" onClick={() => eliminar(vuelo)}>
                    Eliminar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PanelVuelos
