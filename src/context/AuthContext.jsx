import { createContext, useContext, useState } from 'react'
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
  const [usuario, setUsuario] = useState(() => leerToken(obtenerToken()))

  const login = async (username, password) => {
    const { token } = await api('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    guardarToken(token)
    const datos = leerToken(token)
    setUsuario(datos)
    return datos
  }

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // Aunque falle el pedido, del lado del front la sesion se cierra igual
    }
    borrarToken()
    setUsuario(null)
  }

  const valor = {
    usuario,
    estaLogueado: usuario !== null,
    esComprador: usuario?.rol === 'COMPRADOR',
    esVendedor: usuario?.rol === 'VENDEDOR',
    esAdmin: usuario?.rol === 'ADMIN',
    login,
    logout,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// Hook propio para usar la sesion: const { usuario, login } = useAuth()
// oxlint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext)
