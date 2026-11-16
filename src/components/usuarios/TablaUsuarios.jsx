import FilaUsuario from './FilaUsuario'
import './TablaUsuarios.css'

function TablaUsuarios({ usuarios, miUsername, roles, cambios, guardando, onElegirRol, onGuardar }) {
  return (
    <div className="usuarios-tabla-contenedor">
      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Registrado</th>
            <th>Rol</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <FilaUsuario
              key={u.id}
              usuario={u}
              soyYo={u.username === miUsername}
              roles={roles}
              rolPendiente={cambios[u.id]}
              guardando={guardando === u.id}
              onElegirRol={onElegirRol}
              onGuardar={onGuardar}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaUsuarios
