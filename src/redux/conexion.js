import axios from 'axios'
import { BASE_URL, mensajeDeError, obtenerToken } from '../api/api'

// Un solo cliente para todos los slices: la URL base, el token y los errores se resuelven acá y no en cada llamada
export const clienteApi = axios.create({ baseURL: BASE_URL })

// Antes de cada pedido agrega el JWT si hay sesión (hoy sigue en localStorage hasta que auth pase a Redux)
clienteApi.interceptors.request.use((config) => {
  const token = obtenerToken()
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
