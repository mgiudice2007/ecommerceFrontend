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

  // Cada clase tiene un minimo y un maximo de asientos por vuelo (vienen del backend, tabla clases)
  const claseDe = (claseId) => clases.find((c) => String(c.id) === String(claseId))
  const claseNueva = claseDe(nueva.claseId)

  // Una clase mejor no puede costar menos que una mas basica (Economica <= Ejecutiva <= Primera).
  // Devuelve entre que precios tiene que estar, segun las otras clases del vuelo.
  const rangoDePrecio = (claseId, idQueSeEdita) => {
    const nivel = claseDe(claseId)?.nivel
    let desde = null
    let hasta = null
    vuelo.disponibilidades.forEach((d) => {
      const otroNivel = claseDe(d.claseId)?.nivel
      if (d.id === idQueSeEdita || !nivel || !otroNivel) return
      if (otroNivel < nivel && (desde === null || d.precio > desde)) desde = d.precio
      if (otroNivel > nivel && (hasta === null || d.precio < hasta)) hasta = d.precio
    })
    return { desde, hasta }
  }
  const rangoNueva = rangoDePrecio(nueva.claseId, null)

  // "Desde $ 145.900", "Hasta $ 349.000" o "Entre $ 145.900 y $ 349.000"
  const textoRango = ({ desde, hasta }) => {
    if (desde !== null && hasta !== null) return `Entre ${precio(desde)} y ${precio(hasta)}, por las otras clases del vuelo.`
    if (desde !== null) return `Desde ${precio(desde)}: no puede costar menos que una clase más básica.`
    if (hasta !== null) return `Hasta ${precio(hasta)}: no puede costar más que una clase mejor.`
    return ''
  }

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

  const preguntarEliminar = (disponibilidad) => {
    setPregunta({
      titulo: `¿Eliminar la clase ${disponibilidad.claseNombre} de este vuelo?`,
      mensaje:
        'Si estaba en el carrito de algún pasajero, se saca de su carrito. Si ya tiene compras, no se puede eliminar.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => eliminarClase(disponibilidad),
    })
  }

  // DELETE /api/disponibilidades/:id (el backend no deja si la clase ya tiene compras)
  const eliminarClase = (disponibilidad) => {
    setError('')
    setExito('')
    setGuardando(true)
    api(`/api/disponibilidades/${disponibilidad.id}`, { method: 'DELETE' })
      .then(() => {
        setExito(`Se eliminó la clase ${disponibilidad.claseNombre} del vuelo.`)
        onCambio()
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(false))
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
          No se puede bajar el total de asientos por debajo de los que ya se vendieron. Una clase solo se puede
          eliminar si todavía no tiene compras.
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
                            min={Math.max(vendidos, claseDe(d.claseId)?.minimoAsientos ?? 1)}
                            max={claseDe(d.claseId)?.maximoAsientos}
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
                            min={rangoDePrecio(d.claseId, d.id).desde ?? 1}
                            max={rangoDePrecio(d.claseId, d.id).hasta ?? undefined}
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
                          <>
                            <button
                              className="boton boton-secundario"
                              onClick={() =>
                                setEditando({ id: d.id, asientosTotales: d.asientosTotales, precio: d.precio })
                              }
                            >
                              Editar
                            </button>
                            <button
                              className="boton boton-peligro"
                              onClick={() => preguntarEliminar(d)}
                              disabled={guardando}
                            >
                              Eliminar
                            </button>
                          </>
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
                min={claseNueva?.minimoAsientos ?? 1}
                max={claseNueva?.maximoAsientos}
                value={nueva.asientosTotales}
                onChange={(e) => setNueva({ ...nueva, asientosTotales: e.target.value })}
                required
              />
              {claseNueva?.maximoAsientos && (
                <small className="texto-suave">
                  Entre {claseNueva.minimoAsientos ?? 1} y {claseNueva.maximoAsientos} asientos para esta clase.
                </small>
              )}
            </div>
            <div className="campo">
              <label htmlFor="precioClase">Precio por pasajero</label>
              <input
                id="precioClase"
                type="number"
                min={rangoNueva.desde ?? 1}
                max={rangoNueva.hasta ?? undefined}
                step="0.01"
                value={nueva.precio}
                onChange={(e) => setNueva({ ...nueva, precio: e.target.value })}
                required
              />
              {textoRango(rangoNueva) && <small className="texto-suave">{textoRango(rangoNueva)}</small>}
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
