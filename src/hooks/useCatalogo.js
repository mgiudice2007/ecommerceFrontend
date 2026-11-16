import { useEffect, useState } from 'react'
import { api } from '../api/api'

// Lista de consulta (aeropuertos, categorias, clases) que se pide una vez al montar.
export function useCatalogo(ruta) {
  const [lista, setLista] = useState([])

  useEffect(() => {
    api(ruta)
      .then((data) => setLista(data))
      .catch(() => setLista([]))
  }, [ruta])

  return lista
}
