import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/api'
import { precio } from '../../utils/formato'

// Fecha de hoy como "2026-10-01" en horario local (toISOString usaria UTC
// y a la noche en Argentina ya daria el dia siguiente)
const hoy = () => {
  const d = new Date()
  const dosDigitos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

const fechaCorta = (fecha) => new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR')

// Pestaña "Descuentos": promociones por fecha. El backend aplica solo el que
// esta vigente hoy y no deja crear dos activos con fechas que se pisen.
function TabDescuentos({ vuelo, onCambio }) {
  const [descuentos, setDescuentos] = useState([])
  const [nuevo, setNuevo] = useState({ tipoDescuento: 'PORCENTAJE', valor: '', fechaDesde: hoy(), fechaHasta: '' })
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(() => {
    api(`/api/descuentos?vueloId=${vuelo.id}`)
      .then(setDescuentos)
      .catch((err) => setError(err.message))
  }, [vuelo.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  const ejecutar = async (pedido, textoExito) => {
    setError('')
    setExito('')
    setGuardando(true)
    try {
      const respuesta = await pedido()
      setExito(textoExito ?? respuesta.mensaje)
      cargar()
      onCambio() // el precio final del vuelo puede haber cambiado
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setGuardando(false)
    }
  }

  const crear = async (e) => {
    e.preventDefault()
    const ok = await ejecutar(
      () =>
        api('/api/descuentos', {
          method: 'POST',
          body: { ...nuevo, vueloId: vuelo.id, valor: Number(nuevo.valor) },
        }),
      'Descuento creado.',
    )
    if (ok) setNuevo({ tipoDescuento: 'PORCENTAJE', valor: '', fechaDesde: hoy(), fechaHasta: '' })
  }

  // Prende o apaga un descuento sin borrarlo (PUT con activo cambiado)
  const alternarActivo = (d) =>
    ejecutar(
      () =>
        api(`/api/descuentos/${d.id}`, {
          method: 'PUT',
          body: {
            vueloId: vuelo.id,
            tipoDescuento: d.tipoDescuento,
            valor: d.valor,
            fechaDesde: d.fechaDesde,
            fechaHasta: d.fechaHasta,
            activo: !d.activo,
          },
        }),
      d.activo ? 'Descuento pausado.' : 'Descuento activado.',
    )

  const eliminar = (d) => {
    if (!window.confirm('¿Eliminar este descuento? Las compras ya hechas mantienen su precio.')) return
    ejecutar(() => api(`/api/descuentos/${d.id}`, { method: 'DELETE' }))
  }

  const textoValor = (d) => (d.tipoDescuento === 'PORCENTAJE' ? `${Number(d.valor)}%` : precio(d.valor))

  const estado = (d) => {
    if (d.vigente) return <span className="etiqueta etiqueta-exito">Vigente hoy</span>
    if (!d.activo) return <span className="etiqueta etiqueta-cancelada">Pausado</span>
    if (d.fechaHasta < hoy()) return <span className="etiqueta">Vencido</span>
    return <span className="etiqueta etiqueta-aviso">Programado</span>
  }

  return (
    <div className="gestion-seccion">
      <section className="tarjeta">
        <h2>Descuentos del vuelo</h2>
        <p className="texto-suave">
          El descuento vigente se resta del precio de todas las clases. Las compras ya hechas no cambian.
        </p>

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {exito && <div className="mensaje mensaje-exito">{exito}</div>}

        {descuentos.length === 0 ? (
          <div className="gestion-vacio">Este vuelo no tiene descuentos.</div>
        ) : (
          <div className="gestion-tabla-contenedor">
            <table className="gestion-tabla">
              <thead>
                <tr>
                  <th>Descuento</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {descuentos.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <strong>{textoValor(d)} OFF</strong>
                    </td>
                    <td>{fechaCorta(d.fechaDesde)}</td>
                    <td>{fechaCorta(d.fechaHasta)}</td>
                    <td>{estado(d)}</td>
                    <td className="acciones">
                      <button className="boton boton-secundario" onClick={() => alternarActivo(d)} disabled={guardando}>
                        {d.activo ? 'Pausar' : 'Activar'}
                      </button>
                      <button className="boton boton-peligro" onClick={() => eliminar(d)} disabled={guardando}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="tarjeta">
        <h2>Nuevo descuento</h2>
        <form onSubmit={crear}>
          <div className="campo">
            <label htmlFor="tipoDescuento">Tipo</label>
            <select
              id="tipoDescuento"
              value={nuevo.tipoDescuento}
              onChange={(e) => setNuevo({ ...nuevo, tipoDescuento: e.target.value })}
            >
              <option value="PORCENTAJE">Porcentaje (%)</option>
              <option value="MONTO_FIJO">Monto fijo ($)</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="valor">{nuevo.tipoDescuento === 'PORCENTAJE' ? 'Porcentaje' : 'Monto a descontar'}</label>
            <input
              id="valor"
              type="number"
              min="1"
              max={nuevo.tipoDescuento === 'PORCENTAJE' ? 100 : undefined}
              step="0.01"
              value={nuevo.valor}
              onChange={(e) => setNuevo({ ...nuevo, valor: e.target.value })}
              placeholder={nuevo.tipoDescuento === 'PORCENTAJE' ? 'Ej: 20' : 'Ej: 5000'}
              required
            />
          </div>
          <div className="fila-campos">
            <div className="campo">
              <label htmlFor="fechaDesde">Desde</label>
              <input
                id="fechaDesde"
                type="date"
                value={nuevo.fechaDesde}
                onChange={(e) => setNuevo({ ...nuevo, fechaDesde: e.target.value })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="fechaHasta">Hasta</label>
              <input
                id="fechaHasta"
                type="date"
                min={nuevo.fechaDesde}
                value={nuevo.fechaHasta}
                onChange={(e) => setNuevo({ ...nuevo, fechaHasta: e.target.value })}
                required
              />
            </div>
          </div>
          <button className="boton boton-primario boton-ancho" disabled={guardando}>
            Crear descuento
          </button>
        </form>
      </section>
    </div>
  )
}

export default TabDescuentos
