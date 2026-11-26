// Datos de la sesión que viajan dentro del JWT. Devuelve null si el token no existe, está mal formado o ya venció
export const leerToken = (token) => {
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
