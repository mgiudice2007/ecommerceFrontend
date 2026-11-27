import { useEffect, useRef } from 'react'

// Botón "Descargar PDF" de la orden de compra. El padre pide el archivo al back (slice `ordenes`) y le pasa
// su dirección local en `url`: el botón la baja con un <a download> escondido, sin tocar window ni document
function BotonPdf({ ordenId, url, descargando, onDescargar, onDescargado }) {
  const enlace = useRef(null)
  // La última dirección bajada se libera recién al salir de la página, cuando la descarga ya terminó
  const ultimaUrl = useRef(null)

  useEffect(() => {
    if (!url) return
    if (ultimaUrl.current) URL.revokeObjectURL(ultimaUrl.current)
    ultimaUrl.current = url
    enlace.current.click()
    onDescargado()
  }, [url, onDescargado])

  useEffect(
    () => () => {
      if (ultimaUrl.current) URL.revokeObjectURL(ultimaUrl.current)
    },
    [],
  )

  return (
    <>
      <button className="boton boton-secundario" onClick={onDescargar} disabled={descargando}>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        {descargando ? 'Preparando PDF…' : 'Descargar PDF'}
      </button>
      <a ref={enlace} href={url ?? undefined} download={`orden-de-compra-${ordenId}.pdf`} hidden>
        Orden de compra #{ordenId}
      </a>
    </>
  )
}

export default BotonPdf
