import { api } from '../api/api'
import { sumarDias } from './formato'

export const POR_PAGINA = 10
export const DIAS_FLEXIBLES = 3

const filtrarPorFecha = (params, fecha) => {
  params.set('fechaDesde', sumarDias(fecha, -DIAS_FLEXIBLES))
  params.set('fechaHasta', sumarDias(fecha, DIAS_FLEXIBLES))
}

export const esIdaYVuelta = (searchParams) =>
  searchParams.get('viaje') === 'idavuelta' && Boolean(searchParams.get('origen') && searchParams.get('destino'))

export const buscarVuelos = (params) => api(`/api/vuelos?${params.toString()}`)

// Convierte la URL de la busqueda en los pedidos al backend:
// { ida, vuelta } (vuelta es null si el viaje es solo de ida). Devuelve null si falta la ruta.
export const consultasDeBusqueda = (busqueda) => {
  const params = new URLSearchParams(busqueda)
  if (!params.get('origen') || !params.get('destino')) return null

  const conVuelta = esIdaYVuelta(params)
  const fechaIda = params.get('ida')
  const fechaVuelta = params.get('vuelta')
  for (const clave of ['viaje', 'tramo', 'ida', 'vuelta', 'adultos', 'ninos', 'bebes']) {
    params.delete(clave)
  }

  if (!conVuelta) {
    if (fechaIda) filtrarPorFecha(params, fechaIda)
    params.set('page', params.get('page') ?? 0)
    params.set('size', POR_PAGINA)
    return { ida: params, vuelta: null }
  }

  params.delete('page')
  const vuelta = new URLSearchParams(params)
  vuelta.set('origen', params.get('destino'))
  vuelta.set('destino', params.get('origen'))
  if (fechaIda) filtrarPorFecha(params, fechaIda)
  if (fechaVuelta) {
    filtrarPorFecha(vuelta, fechaVuelta)
  } else if (fechaIda) {
    vuelta.set('fechaDesde', fechaIda)
  }
  return { ida: params, vuelta }
}

// Pasajeros de la URL, para pasarlos al detalle de cada vuelo.
export const consultaDePasajeros = (searchParams) =>
  searchParams.get('adultos')
    ? `?adultos=${searchParams.get('adultos')}&ninos=${searchParams.get('ninos') ?? 0}&bebes=${searchParams.get('bebes') ?? 0}`
    : ''

// Igual, pero marcando que se esta eligiendo el tramo de ida de un viaje de ida y vuelta.
export const consultaDeTramoIda = (searchParams) => {
  const p = new URLSearchParams(consultaDePasajeros(searchParams))
  p.set('viaje', 'idavuelta')
  p.set('tramo', 'ida')
  p.set('origen', searchParams.get('origen') ?? '')
  p.set('destino', searchParams.get('destino') ?? '')
  if (searchParams.get('ida')) p.set('ida', searchParams.get('ida'))
  if (searchParams.get('vuelta')) p.set('vuelta', searchParams.get('vuelta'))
  return `?${p.toString()}`
}
