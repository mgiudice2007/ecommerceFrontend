import Campo from '../comunes/Campo'
import './FiltrosUsuarios.css'

function FiltrosUsuarios({ busqueda, onBusqueda, filtroRol, onFiltroRol, roles }) {
  return (
    <div className="usuarios-filtros">
      <Campo id="busqueda" etiqueta="Buscar">
        <input
          id="busqueda"
          type="search"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          placeholder="Usuario, nombre o mail"
        />
      </Campo>
      <Campo id="filtroRol" etiqueta="Rol">
        <select id="filtroRol" value={filtroRol} onChange={(e) => onFiltroRol(e.target.value)}>
          <option value="">Todos</option>
          {roles.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.nombre}
            </option>
          ))}
        </select>
      </Campo>
    </div>
  )
}

export default FiltrosUsuarios
