import { api } from '../api/api'

// Pregunta si de verdad quiere cancelar. Devuelve true o false.
export const confirmarCancelacion = (orden) =>
  window.confirm(`¿Seguro que querés cancelar la compra #${orden.id}? Se liberan los asientos y no se puede deshacer.`)

// POST /api/ordenes/:id/cancelar: el backend devuelve los asientos al vuelo y la
// orden pasa a CANCELADA. Devuelve la promesa con la orden actualizada.
// La usan "Mis compras" y el detalle de una compra.
export const cancelarOrden = (orden) => api(`/api/ordenes/${orden.id}/cancelar`, { method: 'POST' })
