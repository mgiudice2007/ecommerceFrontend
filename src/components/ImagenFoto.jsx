import { useEffect, useState } from 'react'
import { pedirImagen } from '../api/api'

// Muestra la imagen de una foto. Como en el ejemplo de clase, la imagen llega
// en Base64 (GET /api/fotos/{id}) y se usa como "data URL" en el src del <img>.
function ImagenFoto({ fotoId, alt, className }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    pedirImagen(fotoId)
      .then((imagen) => setSrc(imagen))
      .catch(() => setSrc(null))
  }, [fotoId])

  // Mientras llega la imagen, un recuadro vacio del mismo tamaño
  if (!src) {
    return <div className={className} aria-hidden="true" />
  }

  return <img className={className} src={src} alt={alt} />
}

export default ImagenFoto
