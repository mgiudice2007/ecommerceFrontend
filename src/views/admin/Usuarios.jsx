import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import { useAuth } from '../../context/AuthContext'
import { fechaLarga } from '../../utils/formato'
import './Panel.css'
import './Usuarios.css'

// Roles que el admin puede asignar. La aerolinea tiene un unico vendedor (el admin),
// asi que VENDEDOR ya no se asigna; solo se muestra si una cuenta vieja lo tiene.
const ROLES = [
  { valor: 'COMPRADOR', nombre: 'Comprador', plural: 'Compradores' },
  { valor: 'ADMIN', nombre: 'Administrador', plural: 'Administradores' },
]

const nombreDeRol = (valor) =>
  ROLES.find((r) => r.valor === valor)?.nombre ?? (valor === 'VENDEDOR' ? 'Vendedor (sin permisos)' : valor)

// Administracion de cuentas y asignacion de permisos (solo ADMIN).
// GET /api/usuarios trae todas las cuentas; PUT /api/usuarios/:id/rol cambia el rol.
function Usuarios() {
  const { usuario: yo } = useAuth()

  const [usuarios, setUsuarios] = useState(null)
  const [cambios, setCambios] = useState({}) // { idUsuario: rolElegido } de las filas sin guardar
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(null)

  useEffect(() => {
    api('/api/usuarios')
      .then(setUsuarios)
      .catch((err) => setError(err.message))
  }, [])

  const elegirRol = (usuario, rol) => {
    setExito('')
    // Si vuelve a elegir el rol que ya tenia, deja de ser un cambio pendiente
    const nuevos = { ...cambios }
    if (rol === usuario.rol) delete nuevos[usuario.id]
    else nuevos[usuario.id] = rol
    setCambios(nuevos)
  }

  const guardar = (usuario) => {
    const rol = cambios[usuario.id]
    const nombreRol = nombreDeRol(rol)
    if (!window.confirm(`¿Cambiar a ${usuario.username} a ${nombreRol}?`)) return

    setError('')
    setExito('')
    setGuardando(usuario.id)
    api(`/api/usuarios/${usuario.id}/rol`, { method: 'PUT', body: { rol } })
      .then((actualizado) => {
        setUsuarios(usuarios.map((u) => (u.id === actualizado.id ? actualizado : u)))
        // Ya se guardo: deja de ser un cambio pendiente
        const pendientes = { ...cambios }
        delete pendientes[usuario.id]
        setCambios(pendientes)
        setExito(`${actualizado.username} ahora es ${nombreRol}. El cambio rige desde su próximo pedido.`)
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(null))
  }

  const texto = busqueda.trim().toLowerCase()
  const visibles = (usuarios ?? []).filter(
    (u) =>
      (!filtroRol || u.rol === filtroRol) &&
      (!texto || `${u.username} ${u.nombre} ${u.apellido} ${u.mail}`.toLowerCase().includes(texto)),
  )

  const cantidadPorRol = (rol) => (usuarios ?? []).filter((u) => u.rol === rol).length

  return (
    <>
      <EncabezadoPagina
        etiqueta="Administrador"
        titulo="Usuarios y permisos"
        subtitulo="Revisá las cuentas registradas y asigná el rol de cada una."
        acciones={
          <Link to="/panel/administradores" className="boton boton-claro">
            + Crear administrador
          </Link>
        }
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        {usuarios && (
          <div className="panel-numeros usuarios-numeros">
            {ROLES.map((r) => (
              <div key={r.valor} className="tarjeta">
                <small>{r.plural}</small>
                <strong>{cantidadPorRol(r.valor)}</strong>
              </div>
            ))}
          </div>
        )}

        {error && <div className="mensaje mensaje-error">{error}</div>}
        {exito && <div className="mensaje mensaje-exito">{exito}</div>}

        <section className="tarjeta">
          <div className="usuarios-filtros">
            <div className="campo">
              <label htmlFor="busqueda">Buscar</label>
              <input
                id="busqueda"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Usuario, nombre o mail"
              />
            </div>
            <div className="campo">
              <label htmlFor="filtroRol">Rol</label>
              <select id="filtroRol" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
                <option value="">Todos</option>
                {ROLES.map((r) => (
                  <option key={r.valor} value={r.valor}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!usuarios && !error && <p className="texto-suave">Cargando usuarios…</p>}
          {usuarios && visibles.length === 0 && <div className="gestion-vacio">Ningún usuario coincide con la búsqueda.</div>}

          {visibles.length > 0 && (
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
                  {visibles.map((u) => {
                    const soyYo = u.username === yo.username
                    const rolElegido = cambios[u.id] ?? u.rol

                    return (
                      <tr key={u.id} className={cambios[u.id] ? 'con-cambios' : ''}>
                        <td>
                          <strong>{u.username}</strong>
                          <small>{u.mail}</small>
                        </td>
                        <td>
                          {u.nombre} {u.apellido}
                        </td>
                        <td>{u.fechaRegistro ? fechaLarga(u.fechaRegistro) : '—'}</td>
                        <td>
                          <select
                            value={rolElegido}
                            onChange={(e) => elegirRol(u, e.target.value)}
                            disabled={soyYo}
                            aria-label={`Rol de ${u.username}`}
                            title={soyYo ? 'No podés cambiar tu propio rol' : undefined}
                          >
                            {ROLES.map((r) => (
                              <option key={r.valor} value={r.valor}>
                                {r.nombre}
                              </option>
                            ))}
                            {u.rol === 'VENDEDOR' && (
                              <option value="VENDEDOR" disabled>
                                {nombreDeRol('VENDEDOR')}
                              </option>
                            )}
                          </select>
                          {soyYo && <small>Sos vos</small>}
                        </td>
                        <td className="acciones">
                          {cambios[u.id] && (
                            <button
                              className="boton boton-primario"
                              onClick={() => guardar(u)}
                              disabled={guardando === u.id}
                            >
                              {guardando === u.id ? 'Guardando…' : 'Guardar'}
                            </button>
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
      </div>
    </>
  )
}

export default Usuarios
