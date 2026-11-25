import { BASE_URL, mensajeDeError, obtenerToken } from '../api/api'

export const URL = BASE_URL

// Encabezado con el JWT para los pedidos que lo necesitan (hoy el token sigue en localStorage hasta migrar auth)
export const conToken = () => ({ headers: { Authorization: `Bearer ${obtenerToken()}` } })

// El mensaje que se muestra cuando un pedido de axios falla: el del backend si lo mandó, o uno genérico
export const textoDeError = (error) =>
  error.response
    ? mensajeDeError(error.response.data, error.response.status)
    : 'No se pudo conectar con el servidor. ¿Está levantado el backend?'
