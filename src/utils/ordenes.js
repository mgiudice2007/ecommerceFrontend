import { api } from '../api/api'

// Pide confirmacion y cancela la orden (POST /api/ordenes/:id/cancelar).
// El backend devuelve los asientos al vuelo y la orden pasa a CANCELADA.
// Devuelve la orden actualizada, o null si el usuario se arrepintio.
// La usan "Mis compras" y el detalle de una compra.
export const cancelarOrden = async (orden) => {
  const seguro = window.confirm(
    `¿Seguro que querés cancelar la compra #${orden.id}? Se liberan los asientos y no se puede deshacer.`,
  )
  if (!seguro) return null
  return api(`/api/ordenes/${orden.id}/cancelar`, { method: 'POST' })
}
