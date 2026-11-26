import axios from 'axios'

export const BASE_URL = 'http://localhost:8080'

const mensajeDeError = (data, status) => {
  if (data?.fields) {
    return Object.values(data.fields).join('. ')
  }
  if (data?.error && !['Unauthorized', 'Forbidden'].includes(data.error)) {
    return data.error
  }
  if (status === 401) return 'Tenés que iniciar sesión'
  if (status === 403) return 'No tenés permiso para hacer esto'
  return 'Ocurrió un error inesperado'
}

// Un solo cliente para todos los slices: la URL base, el token y los errores se resuelven acá y no en cada llamada
export const clienteApi = axios.create({ baseURL: BASE_URL })

// El token de la sesión vive en el store (slice `usuario`); store.js se lo pasa a este módulo cada vez que cambia
let token = null

export const fijarToken = (nuevoToken) => {
  token = nuevoToken
}

// Antes de cada pedido agrega el JWT si hay sesión
clienteApi.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si un pedido falla, el error trae el mensaje del backend: así el slice lo guarda con action.error.message
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensaje = error.response
      ? mensajeDeError(error.response.data, error.response.status)
      : 'No se pudo conectar con el servidor. ¿Está levantado el backend?'
    return Promise.reject(new Error(mensaje))
  },
)
