import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { logout } from '../redux/usuarioSlice'
import { millas } from '../utils/formato'
import Logo from './Logo'
import './Navbar.css'

// Valija del carrito (dibujo simple con SVG, toma el color del texto)
const IconoValija = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="4" y="7" width="16" height="13" rx="2" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M9 11v5M15 11v5" />
  </svg>
)

function Navbar() {
  const dispatch = useDispatch()
  const usuario = useSelector((state) => state.usuario.sesion)
  const perfil = useSelector((state) => state.usuario.perfil)
  const carrito = useSelector((state) => state.carrito.carrito)
  const estaLogueado = usuario !== null
  const esComprador = usuario?.rol === 'COMPRADOR'
  const esAdmin = usuario?.rol === 'ADMIN'
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)

  const cerrarMenu = () => {
    setMenuAbierto(false)
    setCuentaAbierta(false)
  }

  const cerrarSesion = () => {
    cerrarMenu()
    dispatch(logout())
  }

  const cantidadCarrito = carrito ? carrito.items.reduce((total, item) => total + item.cantidad, 0) : 0
  const nombre = perfil?.nombre || usuario?.username || ''
  const nombreCompleto = perfil?.nombre ? `${perfil.nombre} ${perfil.apellido ?? ''}` : nombre

  return (
    <header className="navbar">
      <div className="contenedor navbar-interior">
        <Logo />

        <button
          className="navbar-hamburguesa"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuAbierto ? 'abierto' : ''}`} onClick={cerrarMenu}>

          {esComprador && <NavLink to="/mis-compras">Mis compras</NavLink>}
          {esComprador && (
            <NavLink to="/carrito" className="navbar-carrito">
              <span className="navbar-valija">
                <IconoValija />
                {cantidadCarrito > 0 && (
                  <span className="navbar-contador" aria-label={`${cantidadCarrito} pasajes`}>
                    {cantidadCarrito}
                  </span>
                )}
              </span>
              Carrito
            </NavLink>
          )}
          {esAdmin && (
            <NavLink to="/panel" end>
              Panel de vuelos
            </NavLink>
          )}
          {esAdmin && <NavLink to="/panel/usuarios">Usuarios</NavLink>}

          {estaLogueado ? (
            <div className="navbar-usuario" onClick={(e) => e.stopPropagation()}>
              <button className="navbar-cuenta" onClick={() => setCuentaAbierta(!cuentaAbierta)} aria-expanded={cuentaAbierta}>
                <span className="navbar-inicial" aria-hidden="true">
                  {nombre[0]?.toUpperCase()}
                </span>
                <span className="navbar-viajero">
                  {nombre}
                  <small>{esComprador && perfil ? `✈ ${millas(perfil.millas)} millas` : esAdmin ? 'Administrador' : 'Pasajero BCA'}</small>
                </span>
                <span className={`navbar-flecha ${cuentaAbierta ? 'abierta' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {cuentaAbierta && (
                <div className="navbar-desplegable" onClick={cerrarMenu}>
                  <div className="navbar-desplegable-titular">
                    <span className="navbar-inicial grande" aria-hidden="true">
                      {nombre[0]?.toUpperCase()}
                    </span>
                    <div>
                      <strong>{nombreCompleto}</strong>
                      <small>{esAdmin ? 'Administrador' : 'Pasajero BCA'}</small>
                      {esComprador && perfil && (
                        <span className="navbar-millas">✈ {millas(perfil.millas)} millas</span>
                      )}
                    </div>
                  </div>
                  <NavLink to="/perfil">
                    <span aria-hidden="true">👤</span> Tu cuenta
                  </NavLink>
                  {esComprador && (
                    <NavLink to="/mis-compras">
                      <span aria-hidden="true">🧾</span> Mis viajes
                    </NavLink>
                  )}
                  {esAdmin && (
                    <NavLink to="/panel" end>
                      <span aria-hidden="true">✈</span> Panel de vuelos
                    </NavLink>
                  )}
                  <button onClick={cerrarSesion}>
                    <span aria-hidden="true">↪</span> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-usuario">
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/registro" className="boton boton-accion">
                Registrarse
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
