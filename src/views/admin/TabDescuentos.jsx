import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import CampoFecha from '../../components/CampoFecha'
import Confirmacion from '../../components/Confirmacion'
import { hoy, precio } from '../../utils/formato'

const fechaCorta = (fecha) => new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR')

// Pestaña "Descuentos": promociones por fecha. El backend aplica solo el que
// esta vigente hoy y no deja crear dos activos con fechas que se pisen.
function TabDescuentos({ vuelo, onCambio }) {
  const [descuentos, setDescuentos] = useState([])
  const [nuevo, setNuevo] = useState({ tipoDescuento: 'PORCENTAJE', valor: '', fechaDesde: hoy(), fechaHasta: '' })
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)
  // El cartel de confirmacion de la accion elegida: { titulo, mensaje, detalle, textoConfirmar, peligro, accion }
  const [pregunta, setPregunta] = useState(null)
  // Cada vez que cambia, el useEffect vuelve a pedir la lista de descuentos
  const [recargar, setRecargar] = useState(0)

  useEffect(() => {
    api(`/api/descuentos?vueloId=${vuelo.id}`)
      .then((data) => setDescuentos(data))
      .catch((err) => setError(err.message))
  }, [vuelo.id, recargar])

  // Manda el pedido y, si sale bien, muestra el mensaje y recarga los descuentos.
  // Devuelve true o false para saber si salio bien.
  const ejecutar = (url, options, textoExito) => {
    setError('')
    setExito('')
    setGuardando(true)
    return api(url, options)
      .then((respuesta) => {
        setExito(textoExito ?? respuesta.mensaje)
        setRecargar(recargar + 1)
        onCambio() // el precio final del vuelo puede haber cambiado
        return true
      })
      .catch((err) => {
        setError(err.message)
        return false
      })
      .finally(() => setGuardando(false))
  }

  // Cada accion pide confirmacion antes de mandarse al backend
  const crear = (e) => {
    e.preventDefault()
    if (!nuevo.fechaDesde || !nuevo.fechaHasta) {
      setError('Completá las fechas del descuento')
      return
    }
    setPregunta({
      titulo: '¿Crear este descuento?',
      detalle: [
        `Descuento: ${textoValor({ ...nuevo, valor: Number(nuevo.valor) })} OFF`,
        `Desde: ${fechaCorta(nuevo.fechaDesde)}`,
        `Hasta: ${fechaCorta(nuevo.fechaHasta)}`,
      ],
      textoConfirmar: 'Sí, crear',
      accion: crearDescuento,
    })
  }

  const crearDescuento = () => {
    const body = { ...nuevo, vueloId: vuelo.id, valor: Number(nuevo.valor) }
    ejecutar('/api/descuentos', { method: 'POST', body }, 'Descuento creado.').then((ok) => {
      if (ok) setNuevo({ tipoDescuento: 'PORCENTAJE', valor: '', fechaDesde: hoy(), fechaHasta: '' })
    })
  }

  const alternarActivo = (d) => {
    setPregunta({
      titulo: `¿${d.activo ? 'Pausar' : 'Activar'} el descuento de ${textoValor(d)}?`,
      mensaje: d.activo
        ? 'Mientras esté pausado no se aplica al precio del vuelo.'
        : 'Vuelve a aplicarse al precio del vuelo en sus fechas.',
      textoConfirmar: d.activo ? 'Sí, pausar' : 'Sí, activar',
      accion: () => cambiarActivo(d),
    })
  }

  const preguntarEliminar = (d) => {
    setPregunta({
      titulo: '¿Eliminar este descuento?',
      mensaje: 'Las compras ya hechas mantienen su precio.',
      textoConfirmar: 'Sí, eliminar',
      peligro: true,
      accion: () => eliminar(d),
    })
  }

  // Prende o apaga un descuento sin borrarlo (PUT con activo cambiado)
  const cambiarActivo = (d) => {
    const body = {
      vueloId: vuelo.id,
      tipoDescuento: d.tipoDescuento,
      valor: d.valor,
      fechaDesde: d.fechaDesde,
      fechaHasta: d.fechaHasta,
      activo: !d.activo,
    }
    ejecutar(`/api/descuentos/${d.id}`, { method: 'PUT', body }, d.activo ? 'Descuento pausado.' : 'Descuento activado.')
  }

  const eliminar = (d) => {
    ejecutar(`/api/descuentos/${d.id}`, { method: 'DELETE' })
  }

  // El descuento va de hoy al dia que sale el vuelo (el backend controla lo mismo)
  const diaDelVuelo = vuelo.fechaSalida.slice(0, 10) // "2026-11-06T07:15:00" -> "2026-11-06"

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
                      <button className="boton boton-peligro" onClick={() => preguntarEliminar(d)} disabled={guardando}>
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
              <CampoFecha
                id="fechaDesde"
                min={hoy()}
                max={diaDelVuelo}
                value={nuevo.fechaDesde}
                onChange={(valor) => setNuevo({ ...nuevo, fechaDesde: valor })}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="fechaHasta">Hasta</label>
              <CampoFecha
                id="fechaHasta"
                min={nuevo.fechaDesde}
                max={diaDelVuelo}
                value={nuevo.fechaHasta}
                onChange={(valor) => setNuevo({ ...nuevo, fechaHasta: valor })}
                required
              />
            </div>
          </div>
          <button className="boton boton-primario boton-ancho" disabled={guardando}>
            Crear descuento
          </button>
        </form>
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

export default TabDescuentos
