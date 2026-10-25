import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import { precio } from '../../utils/formato'

// Pestaña "Clases y asientos": cada fila es una Disponibilidad del vuelo
// (una clase con su cantidad de asientos y su precio).
function TabClases({ vuelo, onCambio }) {
  // Datos del catalogo para los selects (si falla un pedido, ese select queda vacio)
  const [clases, setClases] = useState([])

  useEffect(() => {
    api('/api/clases')
      .then((data) => setClases(data))
      .catch(() => setClases([]))
  }, [])

  const [nueva, setNueva] = useState({ claseId: '', asientosTotales: '', precio: '' })
  const [editando, setEditando] = useState(null) // { id, asientosTotales, precio }
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)
  // El cartel de confirmacion de la accion elegida: { titulo, mensaje, detalle, textoConfirmar, peligro, accion }
  const [pregunta, setPregunta] = useState(null)

  // Solo se pueden agregar las clases que el vuelo todavia no tiene
  const clasesLibres = clases.filter((c) => !vuelo.disponibilidades.some((d) => d.claseId === c.id))

  // Cada clase tiene un maximo de asientos por vuelo (viene del backend, tabla clases)
  const maximoDe = (claseId) => clases.find((c) => String(c.id) === String(claseId))?.maximoAsientos
  const maximoNueva = maximoDe(nueva.claseId)

  // Antes de agregar la clase se muestra lo que se va a cargar y se pide confirmacion
  const agregar = (e) => {
    e.preventDefault()
    const clase = clases.find((c) => String(c.id) === nueva.claseId)
    setPregunta({
      titulo: `¿Agregar la clase ${clase?.nombre ?? ''}?`,
      detalle: [`Asientos: ${nueva.asientosTotales}`, `Precio por pasajero: ${precio(nueva.precio)}`],
      textoConfirmar: 'Sí, agregar',
      accion: agregarClase,
    })
  }

  const agregarClase = () => {
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

  // Antes de guardar se muestra que cambia (antes -> despues) y se pide confirmacion
  const guardarEdicion = (disponibilidad) => {
    const detalle = []
    if (Number(editando.asientosTotales) !== disponibilidad.asientosTotales) {
      detalle.push(`Asientos: ${disponibilidad.asientosTotales} → ${editando.asientosTotales}`)
    }
    if (Number(editando.precio) !== Number(disponibilidad.precio)) {
      detalle.push(`Precio por pasajero: ${precio(disponibilidad.precio)} → ${precio(editando.precio)}`)
    }
    if (detalle.length === 0) {
      setEditando(null) // no cambio nada: no hay nada que guardar
      return
    }
    setPregunta({
      titulo: `¿Guardar los cambios de la clase ${disponibilidad.claseNombre}?`,
      detalle,
      textoConfirmar: 'Sí, guardar',
      accion: () => guardarClase(disponibilidad),
    })
  }

  const guardarClase = (disponibilidad) => {
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
                            min={Math.max(vendidos, 1)}
                            max={maximoDe(d.claseId)}
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
                max={maximoNueva}
                value={nueva.asientosTotales}
                onChange={(e) => setNueva({ ...nueva, asientosTotales: e.target.value })}
                required
              />
              {maximoNueva && <small className="texto-suave">Entre 1 y {maximoNueva} asientos para esta clase.</small>}
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

      {/* Renderizado condicional: el cartel aparece cuando hay una accion esperando confirmacion */}
      {pregunta && (
        <Confirmacion
          titulo={pregunta.titulo}
          mensaje={pregunta.mensaje}
          detalle={pregunta.detalle}
          textoConfirmar={pregunta.textoConfirmar}
          peligro={pregunta.peligro}
          onConfirmar={() => {
            setPregunta(null)
            pregunta.accion()
          }}
          onCancelar={() => setPregunta(null)}
        />
      )}
    </div>
  )
}

export default TabClases
