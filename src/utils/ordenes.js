import { api } from '../api/api'
import { fechaLarga, hora } from './formato'

// POST /api/ordenes/:id/cancelar: el backend devuelve los asientos al vuelo y la
// orden pasa a CANCELADA. Devuelve la promesa con la orden actualizada.
// La usan "Mis compras" y el detalle de una compra.
export const cancelarOrden = (orden) => api(`/api/ordenes/${orden.id}/cancelar`, { method: 'POST' })

// Hasta cuando se puede cancelar. El backend manda sePuedeCancelar y cancelableHasta:
// se puede hasta 24 horas antes de que salga el primer vuelo de la compra.
export const textoCancelacion = (orden) =>
  orden.sePuedeCancelar
    ? `Podés cancelar sin cargo hasta el ${fechaLarga(orden.cancelableHasta)} a las ${hora(orden.cancelableHasta)} hs (24 horas antes del vuelo).`
    : 'Ya no se puede cancelar: faltan menos de 24 horas para el vuelo o el vuelo ya salió.'

// Los numeros de vuelo de una compra, sin repetir: ["BC1512", "BC1513"]
export const numerosDeVuelo = (orden) => {
  const numeros = []
  orden.items.forEach((item) => {
    if (!numeros.includes(item.numeroVuelo)) numeros.push(item.numeroVuelo)
  })
  return numeros
}
