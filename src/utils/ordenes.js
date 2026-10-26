import { api } from '../api/api'
import { fechaLarga, hora } from './formato'

export const cancelarOrden = (orden) => api(`/api/ordenes/${orden.id}/cancelar`, { method: 'POST' })

export const textoCancelacion = (orden) =>
  orden.sePuedeCancelar
    ? `Podés cancelar sin cargo hasta el ${fechaLarga(orden.cancelableHasta)} a las ${hora(orden.cancelableHasta)} hs (24 horas antes del vuelo).`
    : 'Ya no se puede cancelar: faltan menos de 24 horas para el vuelo o el vuelo ya salió.'

export const numerosDeVuelo = (orden) => {
  const numeros = []
  orden.items.forEach((item) => {
    if (!numeros.includes(item.numeroVuelo)) numeros.push(item.numeroVuelo)
  })
  return numeros
}
