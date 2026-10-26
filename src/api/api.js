export const BASE_URL = 'http://localhost:8080'

const TOKEN_KEY = 'token'

export const obtenerToken = () => localStorage.getItem(TOKEN_KEY)
export const guardarToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const borrarToken = () => localStorage.removeItem(TOKEN_KEY)

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

export const api = (url, opciones = {}) => {
  const { method = 'GET', body } = opciones
  const headers = {}

  const token = obtenerToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const esArchivo = body instanceof FormData
  if (body && !esArchivo) {
    headers['Content-Type'] = 'application/json'
  }

  const options = {
    method,
    headers,
    body: body ? (esArchivo ? body : JSON.stringify(body)) : undefined,
  }

  return fetch(`${BASE_URL}${url}`, options)
    .catch(() => {
      throw new Error('No se pudo conectar con el servidor. ¿Está levantado el backend?')
    })
    .then((response) =>
      response.text().then((texto) => {
        const data = texto ? JSON.parse(texto) : null
        if (!response.ok) {
          throw new Error(mensajeDeError(data, response.status))
        }
        return data
      }),
    )
}

export const pedirImagen = (fotoId) =>
  api(`/api/fotos/${fotoId}`).then((imagen) => `data:${imagen.tipo};base64,${imagen.file}`)

export const pedirPortada = (vueloId) =>
  api(`/api/fotos?vueloId=${vueloId}`).then((fotos) => (fotos.length > 0 ? pedirImagen(fotos[0].id) : null))

const pedirPorId = (ids, pedir) => {
  const unicos = ids.filter((id, i) => ids.indexOf(id) === i)
  return Promise.all(unicos.map((id) => pedir(id).catch(() => null))).then((respuestas) => {
    const porId = {}
    unicos.forEach((id, i) => {
      porId[id] = respuestas[i]
    })
    return porId
  })
}

export const pedirPortadas = (vueloIds) => pedirPorId(vueloIds, pedirPortada)
export const pedirVuelos = (vueloIds) => pedirPorId(vueloIds, (id) => api(`/api/vuelos/${id}`))
