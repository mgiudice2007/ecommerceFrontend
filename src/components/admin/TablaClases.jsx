import { useState } from 'react'
import { claseDe, rangoDePrecio } from '../../utils/clases'
import { precio } from '../../utils/formato'
import { sinRuedita } from '../../utils/validaciones'
import ConfirmarPregunta from '../ConfirmarPregunta'
import SinDatos from '../comunes/SinDatos'
import TablaGestion from '../comunes/TablaGestion'

function TablaClases({ vuelo, clases, guardando, onGuardar, onEliminar }) {
  const [editando, setEditando] = useState(null)
  const [pregunta, setPregunta] = useState(null)

  const guardarEdicion = (disponibilidad) => {
    const detalle = []
    if (Number(editando.asientosTotales) !== disponibilidad.asientosTotales) {
      detalle.push(`Asientos: ${disponibilidad.asientosTotales} → ${editando.asientosTotales}`)
    }
    if (Number(editando.precio) !== Number(disponibilidad.precio)) {
      detalle.push(`Precio por pasajero: ${precio(disponibilidad.precio)} → ${precio(editando.precio)}`)
    }
    if (detalle.length === 0) {
      setEditando(null)
      return
    }
    setPregunta({
      titulo: `¿Guardar los cambios de la clase ${disponibilidad.claseNombre}?`,
      detalle,
      textoConfirmar: 'Sí, guardar',
      accion: () => onGuardar(disponibilidad, editando).then((ok) => ok && setEditando(null)),
    })
  }

  const preguntarEliminar = (disponibilidad) => {
    setPregunta({
      titulo: `¿Eliminar la clase ${disponibilidad.claseNombre} de este vuelo?`,
      mensaje:
        'Si estaba en el carrito de algún pasajero, se saca de su carrito. Si ya tiene compras, no se puede eliminar.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => onEliminar(disponibilidad),
    })
  }

  return (
    <section className="tarjeta">
      <h2>Clases del vuelo</h2>
      <p className="texto-suave">
        Cada clase tiene sus asientos y su precio. El precio "desde" que ve el pasajero en la búsqueda es el de la clase
        más barata. No se puede bajar el total de asientos por debajo de los ya vendidos, y una clase solo se puede
        eliminar si todavía no tiene compras.
      </p>

      {vuelo.disponibilidades.length === 0 ? (
        <SinDatos>Este vuelo todavía no tiene clases: agregá una para empezar a vender.</SinDatos>
      ) : (
        <TablaGestion columnas={['Clase', 'Asientos', 'Vendidos', 'Precio']}>
          {vuelo.disponibilidades.map((d) => {
            const vendidos = d.asientosTotales - d.asientosDisponibles
            const enEdicion = editando?.id === d.id
            const rango = rangoDePrecio(vuelo, clases, d.claseId, d.id)

            return (
              <tr key={d.id}>
                <td>
                  <strong>{d.claseNombre}</strong>
                </td>
                <td>
                  {enEdicion ? (
                    <input
                      type="number"
                      onWheel={sinRuedita}
                      min={Math.max(vendidos, claseDe(clases, d.claseId)?.minimoAsientos ?? 1)}
                      max={claseDe(clases, d.claseId)?.maximoAsientos}
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
                      onWheel={sinRuedita}
                      min={rango.desde ?? 1}
                      max={rango.hasta ?? undefined}
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
                      <button className="boton boton-primario" onClick={() => guardarEdicion(d)} disabled={guardando}>
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
                        onClick={() => setEditando({ id: d.id, asientosTotales: d.asientosTotales, precio: d.precio })}
                      >
                        Editar
                      </button>
                      <button className="boton boton-peligro" onClick={() => preguntarEliminar(d)} disabled={guardando}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </TablaGestion>
      )}

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default TablaClases
