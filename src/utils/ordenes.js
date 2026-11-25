import { api } from '../api/api'
import { fechaLarga, hora } from './formato'
import { nombreTipo } from './pasajeros'

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

export const rotuloVuelos = (orden) => (numerosDeVuelo(orden).length === 1 ? 'Vuelo N°' : 'Vuelos N°')

// Lo que lleva el QR de la compra: legible al escanearlo con cualquier lector (compra, vuelos y asientos).
export const textoQr = (orden) => {
  const lineas = ['BCA Airlines', `Compra #${orden.id}`]
  orden.items.forEach((item) => {
    const asientos = item.asientos?.length > 0 ? ` · ${item.asientos.join(' ')}` : ''
    lineas.push(`${item.numeroVuelo} ${item.origen} > ${item.destino} · ${item.cantidad} x ${nombreTipo(item.tipoPasajero).toLowerCase()}${asientos}`)
  })
  return lineas.join('\n')
}

export const textoNumerosDeVuelo = (orden) => `${rotuloVuelos(orden)} ${numerosDeVuelo(orden).join(' · ')}`
