import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, borrarToken, guardarToken, obtenerToken } from '../api/api'

const AuthContext = createContext(null)

const leerToken = (token) => {
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))

    if (payload.exp * 1000 < Date.now()) return null

    return { id: payload.id, username: payload.sub, rol: payload.rol, vence: payload.exp * 1000 }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerToken(obtenerToken()))
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [perfil, setPerfil] = useState(null)
  const navigate = useNavigate()

  const actualizarCarrito = (carrito) => {
    setCantidadCarrito(carrito.items.reduce((total, item) => total + item.cantidad, 0))
  }

  const recargarPerfil = () => {
    api('/api/auth/me')
      .then((data) => setPerfil(data))
      .catch(() => setPerfil(null))
  }

  useEffect(() => {
    if (usuario) {
      recargarPerfil()
    }
  }, [usuario])

  useEffect(() => {
    if (usuario?.rol === 'COMPRADOR') {
      api('/api/carrito')
        .then(actualizarCarrito)
        .catch(() => setCantidadCarrito(0))
    }
  }, [usuario])

  useEffect(() => {
    if (!usuario) return
    const cerrarSesionVencida = () => {
      borrarToken()
      setUsuario(null)
      setPerfil(null)
      setCantidadCarrito(0)
      navigate('/login', { state: { sesionVencida: true } })
    }
    const timer = setTimeout(cerrarSesionVencida, usuario.vence - Date.now())
    return () => clearTimeout(timer)
  }, [usuario, navigate])

  const login = (username, password) =>
    api('/api/auth/login', { method: 'POST', body: { username, password } }).then((data) => {
      guardarToken(data.token)
      const datos = leerToken(data.token)
      setUsuario(datos)
      return datos
    })

  const logout = () =>
    api('/api/auth/logout', { method: 'POST' })
      .catch(() => null)
      .then(() => {
        borrarToken()
        setUsuario(null)
        setPerfil(null)
        setCantidadCarrito(0)
      })

  const valor = {
    usuario,
    estaLogueado: usuario !== null,
    esComprador: usuario?.rol === 'COMPRADOR',
    esAdmin: usuario?.rol === 'ADMIN',
    login,
    logout,
    perfil,
    setPerfil,
    recargarPerfil,
    cantidadCarrito,
    actualizarCarrito,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
