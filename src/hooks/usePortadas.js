import { useEffect, useState } from 'react'
import { pedirPortadas } from '../api/api'

// Portada (primera foto) de cada vuelo de la lista: { [vueloId]: imagen }.
// Se piden de nuevo solo cuando cambian los vuelos que se muestran.
export function usePortadas(vuelos) {
  const ids = vuelos.map((v) => v.id).join(',')
  const [portadas, setPortadas] = useState({})

  useEffect(() => {
    if (!ids) return
    pedirPortadas(ids.split(',').map(Number)).then((datos) => setPortadas((antes) => ({ ...antes, ...datos })))
  }, [ids])

  return portadas
}
