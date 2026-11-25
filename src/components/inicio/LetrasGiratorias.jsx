import { useEffect, useState } from 'react'
import './LetrasGiratorias.css'

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const VUELTAS_POR_LETRA = 5

// Texto de cartel de aeropuerto: cada letra gira mostrando otras letras hasta que se
// "asienta" en la suya, de izquierda a derecha. Para que vuelva a girar, el padre le
// cambia la key (React la monta de nuevo y arranca de cero).
function LetrasGiratorias({ texto, largo = String(texto).length, demora = 0 }) {
  const final = String(texto).toUpperCase().padEnd(largo).slice(0, largo)
  const total = demora + largo + VUELTAS_POR_LETRA
  const [vuelta, setVuelta] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setVuelta((v) => {
        if (v >= total) clearInterval(id)
        return Math.min(v + 1, total)
      })
    }, 55)
    return () => clearInterval(id)
  }, [total])

  return (
    <span className="letras-giratorias" aria-label={final.trim()}>
      {[...final].map((letra, i) => {
        const asentada = vuelta >= demora + i + VUELTAS_POR_LETRA
        const mostrada = asentada || letra === ' ' ? letra : ALFABETO[(i * 7 + vuelta * 11) % ALFABETO.length]
        return (
          <span key={i} className={asentada ? 'letra' : 'letra girando'} aria-hidden="true">
            {mostrada === ' ' ? ' ' : mostrada}
          </span>
        )
      })}
    </span>
  )
}

export default LetrasGiratorias
