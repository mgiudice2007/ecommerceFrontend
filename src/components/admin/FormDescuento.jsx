import { useState } from 'react'
import { hoy } from '../../utils/formato'
import { sinRuedita } from '../../utils/validaciones'
import CampoFecha from '../CampoFecha'
import Campo from '../comunes/Campo'

const formVacio = () => ({ tipoDescuento: 'PORCENTAJE', valor: '', fechaDesde: hoy(), fechaHasta: '' })

function FormDescuento({ diaDelVuelo, guardando, onCrear, onError }) {
  const [nuevo, setNuevo] = useState(formVacio)

  const crear = (e) => {
    e.preventDefault()
    if (!nuevo.fechaDesde || !nuevo.fechaHasta) {
      onError('Completá las fechas del descuento')
      return
    }
    onCrear(nuevo).then((ok) => ok && setNuevo(formVacio()))
  }

  const esPorcentaje = nuevo.tipoDescuento === 'PORCENTAJE'

  return (
    <section className="tarjeta">
      <h2>Nuevo descuento</h2>
      <form onSubmit={crear}>
        <Campo id="tipoDescuento" etiqueta="Tipo">
          <select
            id="tipoDescuento"
            value={nuevo.tipoDescuento}
            onChange={(e) => setNuevo({ ...nuevo, tipoDescuento: e.target.value })}
          >
            <option value="PORCENTAJE">Porcentaje (%)</option>
            <option value="MONTO_FIJO">Monto fijo ($)</option>
          </select>
        </Campo>
        <Campo id="valor" etiqueta={esPorcentaje ? 'Porcentaje' : 'Monto a descontar'}>
          <input
            id="valor"
            type="number"
            onWheel={sinRuedita}
            min="1"
            max={esPorcentaje ? 100 : undefined}
            step="0.01"
            value={nuevo.valor}
            onChange={(e) => setNuevo({ ...nuevo, valor: e.target.value })}
            placeholder={esPorcentaje ? 'Ej: 20' : 'Ej: 5000'}
            required
          />
        </Campo>
        <div className="fila-campos">
          <Campo id="fechaDesde" etiqueta="Desde">
            <CampoFecha
              id="fechaDesde"
              min={hoy()}
              max={diaDelVuelo}
              value={nuevo.fechaDesde}
              onChange={(valor) => setNuevo({ ...nuevo, fechaDesde: valor })}
              required
            />
          </Campo>
          <Campo id="fechaHasta" etiqueta="Hasta">
            <CampoFecha
              id="fechaHasta"
              min={nuevo.fechaDesde}
              max={diaDelVuelo}
              value={nuevo.fechaHasta}
              onChange={(valor) => setNuevo({ ...nuevo, fechaHasta: valor })}
              required
            />
          </Campo>
        </div>
        <button className="boton boton-primario boton-ancho" disabled={guardando}>
          Crear descuento
        </button>
      </form>
    </section>
  )
}

export default FormDescuento
