import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { fechaCorta, hora, precio } from '../../utils/formato'
import { textoDescuento } from '../../utils/vuelos'
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
  const { usuario, esAdmin } = useAuth()
  const [vuelos, setVuelos] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    // El vendedor ve solo sus vuelos (filtro vendedorId con el id del token).
    // El administrador ve los de todos.
    const url = esAdmin ? '/api/vuelos' : `/api/vuelos?vendedorId=${usuario.id}`
    api(url)
      .then((pagina) => setVuelos(pagina.content))
      .catch((err) => setError(err.message))
  }, [esAdmin, usuario.id])

  const eliminar = async (vuelo) => {
    const seguro = window.confirm(
      `¿Eliminar el vuelo ${vuelo.numeroVuelo}? Deja de mostrarse en la búsqueda. Las compras ya hechas no se modifican.`,
    )
    if (!seguro) return

    setError('')
    try {
      const respuesta = await api(`/api/vuelos/${vuelo.id}`, { method: 'DELETE' })
      setVuelos(vuelos.filter((v) => v.id !== vuelo.id))
      setMensaje(respuesta.mensaje) // "Vuelo eliminado correctamente"
    } catch (err) {
      setError(err.message)
    }
  }

  const resumen = (vuelos ?? []).reduce(
    (total, vuelo) => {
      const asientos = asientosDe(vuelo)
      return { totales: total.totales + asientos.totales, vendidos: total.vendidos + asientos.vendidos }
    },
    { totales: 0, vendidos: 0 },
  )

  return (
    <div className="contenedor pagina">
      <header className="panel-encabezado">
        <div>
          <span className="etiqueta">{esAdmin ? 'Administrador' : 'Vendedor'}</span>
          <h1>{esAdmin ? 'Todos los vuelos' : 'Mis vuelos'}</h1>
        </div>
        <div className="panel-encabezado-acciones">
          {esAdmin && (
            <Link to="/panel/administradores" className="boton boton-secundario">
              Crear administrador
            </Link>
          )}
          <Link to="/panel/vuelos/nuevo" className="boton boton-primario">
            + Publicar vuelo
          </Link>
        </div>
      </header>

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

      <div className="panel-lista">
        {vuelos?.map((vuelo) => {
          const asientos = asientosDe(vuelo)
          const descuento = textoDescuento(vuelo.descuentoVigente, precio)
          const sinClases = vuelo.disponibilidades.length === 0

          return (
            <article key={vuelo.id} className="tarjeta panel-vuelo">
              <div className="panel-vuelo-info">
                <div className="panel-vuelo-titulo">
                  <strong>
                    {vuelo.origenIata} → {vuelo.destinoIata}
                  </strong>
                  <span className="texto-suave">
                    Vuelo {vuelo.numeroVuelo} · {fechaCorta(vuelo.fechaSalida)} {hora(vuelo.fechaSalida)} hs
                    {esAdmin && ` · ${vuelo.vendedorUsername}`}
                  </span>
                </div>
                <div className="panel-vuelo-etiquetas">
                  <span className="etiqueta">{vuelo.categoriaNombre}</span>
                  {descuento && <span className="etiqueta etiqueta-exito">{descuento}</span>}
                  {sinClases && <span className="etiqueta etiqueta-aviso">Sin clases cargadas</span>}
                </div>
              </div>

              <div className="panel-vuelo-asientos">
                <small>Vendidos</small>
                <strong>
                  {asientos.vendidos} / {asientos.totales}
                </strong>
              </div>

              <div className="panel-vuelo-acciones">
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
  )
}

export default PanelVuelos
