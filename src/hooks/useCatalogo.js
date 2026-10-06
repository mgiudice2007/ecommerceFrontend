import { useEffect, useState } from 'react'
import { api } from '../api/api'

// Hook propio: trae los datos fijos del catalogo (aeropuertos, categorias y
// clases) que usan los buscadores y formularios. Lo puede usar cualquier
// componente con: const { aeropuertos, categorias, clases } = useCatalogo()
export function useCatalogo() {
  const [aeropuertos, setAeropuertos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [clases, setClases] = useState([])

  useEffect(() => {
    // Si algun pedido falla, ese select queda vacio pero la pagina sigue funcionando
    api('/api/aeropuertos')
      .then((data) => setAeropuertos(data))
      .catch(() => setAeropuertos([]))
    api('/api/categorias')
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
    api('/api/clases')
      .then((data) => setClases(data))
      .catch(() => setClases([]))
  }, [])

  return { aeropuertos, categorias, clases }
}
