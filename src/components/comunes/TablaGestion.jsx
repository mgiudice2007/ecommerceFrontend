import './TablaGestion.css'

// Tabla de las pestañas de gestion: columnas = encabezados, mas una ultima columna sin titulo para las acciones.
function TablaGestion({ columnas, children }) {
  return (
    <div className="gestion-tabla-contenedor">
      <table className="gestion-tabla">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna}>{columna}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export default TablaGestion
