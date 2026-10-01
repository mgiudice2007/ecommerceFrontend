// Todas las llamadas al backend pasan por aca. Se encarga de:
// - agregar el token JWT en el header Authorization,
// - convertir el body a JSON,
// - y transformar los errores del backend en un mensaje legible.

const TOKEN_KEY = 'token'

export const obtenerToken = () => localStorage.getItem(TOKEN_KEY)
export const guardarToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const borrarToken = () => localStorage.removeItem(TOKEN_KEY)

// Arma un mensaje a partir del body de error del GlobalExceptionHandler:
// { status, error } o, si es de validacion, { error, fields: { campo: mensaje } }
const mensajeDeError = (data, status) => {
  if (data?.fields) {
    return Object.values(data.fields).join('. ')
  }
  // Los 401/403 que corta Spring Security antes de llegar al controller
  // vienen con el texto en ingles ("Unauthorized", "Forbidden")
  if (data?.error && !['Unauthorized', 'Forbidden'].includes(data.error)) {
    return data.error
  }
  if (status === 401) return 'Tenés que iniciar sesión'
  if (status === 403) return 'No tenés permiso para hacer esto'
  return 'Ocurrió un error inesperado'
}

export const api = async (url, opciones = {}) => {
  const { method = 'GET', body } = opciones
  const headers = {}

  const token = obtenerToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Si es un FormData (subida de fotos) el navegador arma el Content-Type solo.
  const esArchivo = body instanceof FormData
  if (body && !esArchivo) {
    headers['Content-Type'] = 'application/json'
  }

  let respuesta
  try {
    respuesta = await fetch(url, {
      method,
      headers,
      body: body ? (esArchivo ? body : JSON.stringify(body)) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está levantado el backend?')
  }

  const texto = await respuesta.text()
  const data = texto ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    throw new Error(mensajeDeError(data, respuesta.status))
  }
  return data
}

// URL de la imagen de una foto (el backend devuelve el binario directo).
export const urlFoto = (fotoId) => `/api/fotos/${fotoId}`
