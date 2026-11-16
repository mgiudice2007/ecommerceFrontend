import { useEffect, useState } from 'react'
import { api, pedirImagen } from '../api/api'

const leerArchivo = (archivo) =>
  new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.readAsDataURL(archivo)
  })

// Fotos de un vuelo: fotos[i] es el dato y imagenes[i] la imagen lista para mostrar.
// La primera es la portada.
export function useFotosVuelo(vueloId, { avisar }) {
  const [fotos, setFotos] = useState([])
  const [imagenes, setImagenes] = useState([])
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    api(`/api/fotos?vueloId=${vueloId}`)
      .then((data) => {
        setFotos(data)
        return Promise.all(data.map((foto) => pedirImagen(foto.id)))
      })
      .then((data) => setImagenes(data))
      .catch((err) => avisar('error', err.message))
    // avisar cambia en cada render del padre; las fotos se piden solo al cambiar de vuelo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vueloId])

  const subir = (archivo) => {
    const formData = new FormData()
    formData.append('vueloId', vueloId)
    formData.append('file', archivo)

    setSubiendo(true)
    avisar(null)
    return api('/api/fotos', { method: 'POST', body: formData })
      .then((nueva) => leerArchivo(archivo).then((imagen) => [nueva, imagen]))
      .then(([nueva, imagen]) => {
        setFotos([...fotos, nueva])
        setImagenes([...imagenes, imagen])
        avisar('exito', 'Foto subida.')
        return true
      })
      .catch((err) => {
        avisar('error', err.message)
        return false
      })
      .finally(() => setSubiendo(false))
  }

  const eliminar = (foto) => {
    avisar(null)
    api(`/api/fotos/${foto.id}`, { method: 'DELETE' })
      .then((respuesta) => {
        const indice = fotos.findIndex((f) => f.id === foto.id)
        setFotos(fotos.filter((f) => f.id !== foto.id))
        setImagenes(imagenes.filter((_, i) => i !== indice))
        avisar('exito', respuesta.mensaje)
      })
      .catch((err) => avisar('error', err.message))
  }

  return { fotos, imagenes, subiendo, subir, eliminar }
}
