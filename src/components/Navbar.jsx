import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import './Navbar.css'

function Navbar() {
  const { usuario, perfil, estaLogueado, esComprador, esAdmin, logout, cantidadCarrito } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false) // menu hamburguesa (celular)
  const [cuentaAbierta, setCuentaAbierta] = useState(false) // menu desplegable de la cuenta
  const navigate = useNavigate()

  const cerrarMenu = () => {
    setMenuAbierto(false)
    setCuentaAbierta(false)
  }

  const cerrarSesion = () => {
    logout().then(() => {
      cerrarMenu()
      navigate('/')
    })
  }

  // Arriba se muestra el nombre de la persona; mientras carga el perfil, el usuario
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
          <NavLink to="/vuelos">Vuelos</NavLink>

          {/* Cada rol ve solo los links que le sirven */}
          {esComprador && <NavLink to="/mis-compras">Mis compras</NavLink>}
          {esComprador && (
            <NavLink to="/carrito" className="navbar-carrito">
              Carrito
              {cantidadCarrito > 0 && <span className="navbar-contador">{cantidadCarrito}</span>}
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
                {nombre}
                <span className={`navbar-flecha ${cuentaAbierta ? 'abierta' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {cuentaAbierta && (
                <>
                  {/* Fondo invisible: al tocar afuera se cierra el menu */}
                  <div className="navbar-fondo" onClick={() => setCuentaAbierta(false)} />
                  <div className="navbar-desplegable" onClick={cerrarMenu}>
                    <div className="navbar-desplegable-titular">
                      <span className="navbar-inicial grande" aria-hidden="true">
                        {nombre[0]?.toUpperCase()}
                      </span>
                      <div>
                        <strong>{nombreCompleto}</strong>
                        <small>{esAdmin ? 'Administrador' : 'Pasajero BCA'}</small>
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
                </>
              )}
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
