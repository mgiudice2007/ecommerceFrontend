import { useState } from 'react'
import { api } from '../../api/api'
import { useCatalogo } from '../../hooks/useCatalogo'
import { precio } from '../../utils/formato'

// Pestaña "Clases y asientos": cada fila es una Disponibilidad del vuelo
// (una clase con su cantidad de asientos y su precio).
function TabClases({ vuelo, onCambio }) {
  const { clases } = useCatalogo()

  const [nueva, setNueva] = useState({ claseId: '', asientosTotales: '', precio: '' })
  const [editando, setEditando] = useState(null) // { id, asientosTotales, precio }
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Solo se pueden agregar las clases que el vuelo todavia no tiene
  const clasesLibres = clases.filter((c) => !vuelo.disponibilidades.some((d) => d.claseId === c.id))

  const agregar = (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    setGuardando(true)

    const body = {
      vueloId: vuelo.id,
      claseId: Number(nueva.claseId),
      asientosTotales: Number(nueva.asientosTotales),
      precio: Number(nueva.precio),
    }
    api('/api/disponibilidades', { method: 'POST', body })
      .then(() => {
        setExito('Clase agregada. Ya se puede comprar.')
        setNueva({ claseId: '', asientosTotales: '', precio: '' })
        onCambio() // recarga el vuelo para ver los asientos actualizados
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(false))
  }

  const guardarEdicion = (disponibilidad) => {
    setError('')
    setExito('')
    setGuardando(true)

    const body = {
      vueloId: vuelo.id,
      claseId: disponibilidad.claseId,
      asientosTotales: Number(editando.asientosTotales),
      precio: Number(editando.precio),
    }
    api(`/api/disponibilidades/${disponibilidad.id}`, { method: 'PUT', body })
      .then(() => {
        setExito(`Se actualizó la clase ${disponibilidad.claseNombre}.`)
        setEditando(null)
        onCambio()
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(false))
  }

  return (
    <div className="gestion-seccion">
      <section className="tarjeta">
        <h2>Clases del vuelo</h2>
        <p className="texto-suave">
          No se puede bajar el total de asientos por debajo de los que ya se vendieron.
        </p>

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {exito && <div className="mensaje mensaje-exito">{exito}</div>}

        {vuelo.disponibilidades.length === 0 ? (
          <div className="gestion-vacio">Este vuelo todavía no tiene clases: agregá una para empezar a vender.</div>
        ) : (
          <div className="gestion-tabla-contenedor">
            <table className="gestion-tabla">
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Asientos</th>
                  <th>Vendidos</th>
                  <th>Precio</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {vuelo.disponibilidades.map((d) => {
                  const vendidos = d.asientosTotales - d.asientosDisponibles
                  const enEdicion = editando?.id === d.id

                  return (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.claseNombre}</strong>
                      </td>
                      <td>
                        {enEdicion ? (
                          <input
                            type="number"
                            min={vendidos}
                            value={editando.asientosTotales}
                            onChange={(e) => setEditando({ ...editando, asientosTotales: e.target.value })}
                            aria-label="Asientos totales"
                          />
                        ) : (
                          `${d.asientosDisponibles} libres de ${d.asientosTotales}`
                        )}
                      </td>
                      <td>{vendidos}</td>
                      <td>
                        {enEdicion ? (
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={editando.precio}
                            onChange={(e) => setEditando({ ...editando, precio: e.target.value })}
                            aria-label="Precio"
                          />
                        ) : (
                          <>
                            {precio(d.precio)}
                            {d.precioConDescuento < d.precio && (
                              <small className="texto-suave"> → {precio(d.precioConDescuento)}</small>
                            )}
                          </>
                        )}
                      </td>
                      <td className="acciones">
                        {enEdicion ? (
                          <>
                            <button
                              className="boton boton-primario"
                              onClick={() => guardarEdicion(d)}
                              disabled={guardando}
                            >
                              Guardar
                            </button>
                            <button className="boton boton-secundario" onClick={() => setEditando(null)}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            className="boton boton-secundario"
                            onClick={() =>
                              setEditando({ id: d.id, asientosTotales: d.asientosTotales, precio: d.precio })
                            }
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="tarjeta">
        <h2>Agregar clase</h2>
        {clasesLibres.length === 0 ? (
          <p className="texto-suave">El vuelo ya tiene todas las clases cargadas.</p>
        ) : (
          <form onSubmit={agregar}>
            <div className="campo">
              <label htmlFor="claseId">Clase</label>
              <select
                id="claseId"
                value={nueva.claseId}
                onChange={(e) => setNueva({ ...nueva, claseId: e.target.value })}
                required
              >
                <option value="">Elegí una clase</option>
                {clasesLibres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="asientosTotales">Cantidad de asientos</label>
              <input
                id="asientosTotales"
                type="number"
                min="1"
                value={nueva.asientosTotales}
                onChange={(e) => setNueva({ ...nueva, asientosTotales: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="precioClase">Precio por pasajero</label>
              <input
                id="precioClase"
                type="number"
                min="1"
                step="0.01"
                value={nueva.precio}
                onChange={(e) => setNueva({ ...nueva, precio: e.target.value })}
                required
              />
            </div>
            <button className="boton boton-primario boton-ancho" disabled={guardando}>
              Agregar clase
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

export default TabClases
