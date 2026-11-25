import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de ruta vuelve al principio de la página: se trae el ancla del tope a la vista con un ref
function VolverArriba() {
  const { pathname } = useLocation()
  const tope = useRef(null)

  useEffect(() => {
    tope.current.scrollIntoView()
  }, [pathname])

  return <span ref={tope} />
}

export default VolverArriba
