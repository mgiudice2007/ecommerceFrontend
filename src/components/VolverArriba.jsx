import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Cada vez que cambia la pagina (la URL), vuelve el scroll arriba de todo.
// Sin esto, al navegar se quedaba en la misma altura de la pagina anterior.
function VolverArriba() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null // no dibuja nada
}

export default VolverArriba
