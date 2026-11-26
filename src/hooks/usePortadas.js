import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPortadas } from '../redux/vuelosSlice'

// Portada (primera foto) de cada vuelo, guardada en el store: { [vueloId]: imagen }.
// Solo despacha el pedido de los vuelos cuya portada todavia no esta en el store.
export function usePortadas(vueloIds) {
  const dispatch = useDispatch()
  const portadas = useSelector((state) => state.vuelos.portadas)

  const faltantes = [...new Set(vueloIds)].filter((id) => !(id in portadas)).join(',')

  useEffect(() => {
    if (faltantes) {
      dispatch(fetchPortadas(faltantes.split(',').map(Number)))
    }
  }, [faltantes, dispatch])

  return portadas
}
