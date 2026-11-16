import { sinRuedita } from '../../utils/validaciones'
import Campo from '../comunes/Campo'
import './FiltroPrecio.css'

function FiltroPrecio({ precios, onCambiar, onAplicar, onLimpiar }) {
  const aplicar = (e) => {
    e.preventDefault()
    onAplicar()
  }

  return (
    <aside className="tarjeta vuelos-filtros">
      <h2>Filtrar por precio</h2>
      <form onSubmit={aplicar}>
        <Campo id="precioMin" etiqueta="Precio mínimo">
          <input
            id="precioMin"
            type="number"
            onWheel={sinRuedita}
            min="0"
            value={precios.precioMin}
            onChange={(e) => onCambiar({ ...precios, precioMin: e.target.value })}
            placeholder="$ 0"
          />
        </Campo>
        <Campo id="precioMax" etiqueta="Precio máximo">
          <input
            id="precioMax"
            type="number"
            onWheel={sinRuedita}
            min="0"
            value={precios.precioMax}
            onChange={(e) => onCambiar({ ...precios, precioMax: e.target.value })}
            placeholder="Sin límite"
          />
        </Campo>
        <p className="vuelos-aclaracion">Se compara con el precio base del vuelo, sin descuentos.</p>
        <button className="boton boton-primario boton-ancho">Aplicar</button>
        <button type="button" className="boton boton-secundario boton-ancho" onClick={onLimpiar}>
          Limpiar
        </button>
      </form>
    </aside>
  )
}

export default FiltroPrecio
