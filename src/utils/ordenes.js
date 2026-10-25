import { api } from '../api/api'

// POST /api/ordenes/:id/cancelar: el backend devuelve los asientos al vuelo y la
// orden pasa a CANCELADA. Devuelve la promesa con la orden actualizada.
// La usan "Mis compras" y el detalle de una compra.
export const cancelarOrden = (orden) => api(`/api/ordenes/${orden.id}/cancelar`, { method: 'POST' })

// Los numeros de vuelo de una compra, sin repetir: ["BC1512", "BC1513"]
export const numerosDeVuelo = (orden) => {
  const numeros = []
  orden.items.forEach((item) => {
    if (!numeros.includes(item.numeroVuelo)) numeros.push(item.numeroVuelo)
  })
  return numeros
}
