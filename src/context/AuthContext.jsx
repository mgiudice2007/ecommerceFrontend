import { createContext, useContext, useEffect, useState } from 'react'
import { api, borrarToken, guardarToken, obtenerToken } from '../api/api'

// El contexto permite que cualquier componente (la Navbar, una pagina, etc.)
// sepa quien esta logueado sin tener que pasarlo por props de padre a hijo.
const AuthContext = createContext(null)

// El JWT tiene 3 partes separadas por puntos. La del medio (payload) es un
// JSON en base64 con lo que el backend metio adentro: sub (username), id y rol.
const leerToken = (token) => {
  if (!token) return null
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))

    // exp viene en segundos; si ya vencio, es como no estar logueado
    if (payload.exp * 1000 < Date.now()) return null

    return { id: payload.id, username: payload.sub, rol: payload.rol }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Al abrir la pagina, si habia un token guardado, el usuario sigue logueado
  const [usuario, setUsuario] = useState(leerToken(obtenerToken()))
  const [cantidadCarrito, setCantidadCarrito] = useState(0)

  // Recibe el carrito que devuelve el backend (CarritoResponse) y cuenta los pasajes.
  // Las paginas la llaman despues de agregar, cambiar o borrar items.
  const actualizarCarrito = (carrito) => {
    setCantidadCarrito(carrito.items.reduce((total, item) => total + item.cantidad, 0))
  }

  // Cuando entra un comprador, traemos su carrito para mostrar la cantidad en la Navbar
  useEffect(() => {
    if (usuario?.rol === 'COMPRADOR') {
      api('/api/carrito')
        .then(actualizarCarrito)
        .catch(() => setCantidadCarrito(0))
    }
  }, [usuario])

  // Devuelve una promesa con los datos del usuario (id, username y rol)
  const login = (username, password) =>
    api('/api/auth/login', { method: 'POST', body: { username, password } }).then((data) => {
      guardarToken(data.token) // como en clase: localStorage.setItem
      const datos = leerToken(data.token)
      setUsuario(datos)
      return datos
    })

  const logout = () =>
    api('/api/auth/logout', { method: 'POST' })
      .catch(() => null) // aunque falle el pedido, del lado del front la sesion se cierra igual
      .then(() => {
        borrarToken()
        setUsuario(null)
        setCantidadCarrito(0)
      })

  const valor = {
    usuario,
    estaLogueado: usuario !== null,
    esComprador: usuario?.rol === 'COMPRADOR',
    esAdmin: usuario?.rol === 'ADMIN',
    login,
    logout,
    cantidadCarrito,
    actualizarCarrito,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// Hook propio para usar la sesion: const { usuario, login } = useAuth()
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
