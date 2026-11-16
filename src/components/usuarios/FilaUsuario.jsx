import { fechaLarga } from '../../utils/formato'

function FilaUsuario({ usuario, soyYo, roles, rolPendiente, guardando, onElegirRol, onGuardar }) {
  return (
    <tr className={rolPendiente ? 'con-cambios' : ''}>
      <td>
        <strong>{usuario.username}</strong>
        <small>{usuario.mail}</small>
      </td>
      <td>
        {usuario.nombre} {usuario.apellido}
      </td>
      <td>{usuario.fechaRegistro ? fechaLarga(usuario.fechaRegistro) : '—'}</td>
      <td>
        <select
          value={rolPendiente ?? usuario.rol}
          onChange={(e) => onElegirRol(usuario, e.target.value)}
          disabled={soyYo}
          aria-label={`Rol de ${usuario.username}`}
          title={soyYo ? 'No podés cambiar tu propio rol' : undefined}
        >
          {roles.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.nombre}
            </option>
          ))}
        </select>
        {soyYo && <small>Sos vos</small>}
      </td>
      <td className="acciones">
        {rolPendiente && (
          <button className="boton boton-primario" onClick={() => onGuardar(usuario)} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        )}
      </td>
    </tr>
  )
}

export default FilaUsuario
