import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import './Navbar.css'

function Navbar() {
  const { usuario, estaLogueado, esComprador, esVendedor, esAdmin, logout } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navigate = useNavigate()

  const cerrarMenu = () => setMenuAbierto(false)

  const cerrarSesion = async () => {
    await logout()
    cerrarMenu()
    navigate('/')
  }

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
          <NavLink to="/vuelos">Vuelos</NavLink>

          {/* Cada rol ve solo los links que le sirven */}
          {esComprador && <NavLink to="/mis-compras">Mis compras</NavLink>}
          {esComprador && <NavLink to="/carrito">Carrito</NavLink>}
          {(esVendedor || esAdmin) && <NavLink to="/panel">Panel de vuelos</NavLink>}

          {estaLogueado ? (
            <div className="navbar-usuario" onClick={(e) => e.stopPropagation()}>
              <NavLink to="/perfil" onClick={cerrarMenu} className="navbar-avatar">
                <span aria-hidden="true">{usuario.username[0].toUpperCase()}</span>
                {usuario.username}
              </NavLink>
              <button className="boton boton-secundario navbar-salir" onClick={cerrarSesion}>
                Salir
              </button>
            </div>
          ) : (
            <div className="navbar-usuario">
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/registro" className="boton boton-primario">
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
