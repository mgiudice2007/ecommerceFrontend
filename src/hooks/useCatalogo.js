import { useEffect, useState } from 'react'
import { api } from '../api/api'

// Hook propio: trae los datos fijos del catalogo (aeropuertos, categorias y
// clases) que usan los buscadores y formularios. Lo puede usar cualquier
// componente con: const { aeropuertos, categorias, clases } = useCatalogo()
export function useCatalogo() {
  const [catalogo, setCatalogo] = useState({ aeropuertos: [], categorias: [], clases: [] })

  useEffect(() => {
    // Los tres pedidos salen al mismo tiempo y esperamos a que terminen todos
    Promise.all([api('/api/aeropuertos'), api('/api/categorias'), api('/api/clases')])
      .then(([aeropuertos, categorias, clases]) => setCatalogo({ aeropuertos, categorias, clases }))
      .catch(() => {
        // Si falla, los selects quedan vacios pero la pagina sigue funcionando
      })
  }, [])

  return catalogo
}
