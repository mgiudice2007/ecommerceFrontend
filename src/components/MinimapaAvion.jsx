import { useRef } from 'react'
import './MinimapaAvion.css'

// Todo el avion en chiquito: cada fila es una tira de puntitos (libre, ocupado o elegido) y una franja azul
// marca la parte que se ve en el avion grande. `ventana` dice donde esta esa parte, como fraccion del total
// (inicio 0 = arriba, alto 0.35 = un 35% del avion). Tocar o arrastrar la franja avisa adonde mover el avion
// grande con onMover(fraccion); el scroll lo hace el selector.
function MinimapaAvion({ filas, letras, ventana, estadoDe, conNariz, onMover }) {
  const mitad = letras.length / 2
  // Mientras se arrastra: a qué altura de la franja se la agarró (null si no se está arrastrando)
  const agarre = useRef(null)

  // En qué parte del minimapa está el puntero, de 0 (arriba) a 1 (abajo)
  const fraccionDe = (e) => {
    const caja = e.currentTarget.getBoundingClientRect()
    return (e.clientY - caja.top) / caja.height
  }

  const empezar = (e) => {
    const f = fraccionDe(e)
    const enLaFranja = f >= ventana.inicio && f <= ventana.inicio + ventana.alto
    // Si se toca fuera de la franja, la franja salta centrada ahí; si se la agarra, se mueve desde donde se tocó
    agarre.current = enLaFranja ? f - ventana.inicio : ventana.alto / 2
    e.currentTarget.setPointerCapture(e.pointerId)
    onMover(f - agarre.current, !enLaFranja)
  }

  const arrastrar = (e) => {
    if (agarre.current === null) return
    onMover(fraccionDe(e) - agarre.current, false)
  }

  const soltar = () => {
    agarre.current = null
  }

  // Con el teclado: las flechas mueven una fila y Inicio/Fin van a los extremos
  const unaFila = 1 / filas.length
  const teclas = (e) => {
    const destinos = {
      ArrowUp: ventana.inicio - unaFila,
      ArrowDown: ventana.inicio + unaFila,
      PageUp: ventana.inicio - ventana.alto,
      PageDown: ventana.inicio + ventana.alto,
      Home: 0,
      End: 1,
    }
    if (e.key in destinos) {
      e.preventDefault()
      onMover(destinos[e.key], e.key === 'Home' || e.key === 'End')
    }
  }

  return (
    <div className={`minimapa-avion ${conNariz ? 'con-nariz' : ''}`.trim()}>
      <div
        className="minimapa-filas"
        role="scrollbar"
        aria-label="Mapa completo del avión: tocá o arrastrá la franja para moverte"
        aria-controls="mapa-asientos"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ventana.inicio * 100)}
        tabIndex={0}
        onPointerDown={empezar}
        onPointerMove={arrastrar}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onKeyDown={teclas}
      >
        {filas.map((fila) => (
          <div key={fila.numero} className="minimapa-fila">
            {fila.asientos.map((codigo, i) => (
              <span key={codigo} className={`minimapa-punto ${estadoDe(codigo)} ${i === mitad ? 'despues-del-pasillo' : ''}`} />
            ))}
          </div>
        ))}
        <span
          className="minimapa-franja"
          style={{ top: `${ventana.inicio * 100}%`, height: `${ventana.alto * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}

export default MinimapaAvion
