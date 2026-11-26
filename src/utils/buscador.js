import { SIN_PASAJEROS_EXTRA, textoPasajeros } from './pasajeros'

export const ORIGENES = ['AEP', 'EZE']
export const NOMBRE_ORIGEN = { AEP: 'Aeroparque', EZE: 'Ezeiza' }

export const etiquetaAeropuerto = (aeropuerto) => {
  const nombre = NOMBRE_ORIGEN[aeropuerto.codigoIata]
  return nombre
    ? `${aeropuerto.ciudad} · ${nombre} (${aeropuerto.codigoIata})`
    : `${aeropuerto.ciudad} (${aeropuerto.codigoIata})`
}

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export const buscarAeropuerto = (lista, texto) =>
  lista.find(
    (a) =>
      etiquetaAeropuerto(a).toLowerCase() === texto.trim().toLowerCase() ||
      a.codigoIata.toLowerCase() === texto.trim().toLowerCase(),
  )

// Origenes posibles: solo Aeroparque y Ezeiza.
export const origenesDe = (aeropuertos) => aeropuertos.filter((a) => ORIGENES.includes(a.codigoIata))

// Destinos posibles segun el origen elegido: Aeroparque vuela a Argentina y Ezeiza al exterior.
export const destinosDe = (aeropuertos, origen) =>
  aeropuertos.filter((a) => {
    if (ORIGENES.includes(a.codigoIata)) return false
    if (origen === 'AEP') return a.pais === 'Argentina'
    if (origen === 'EZE') return a.pais !== 'Argentina'
    return true
  })

// Aeropuertos que coinciden con lo que el usuario va escribiendo.
export const sugerenciasDe = (lista, texto, codigoElegido) => {
  const escrito = normalizar(texto.trim())
  const elegido = lista.find((a) => a.codigoIata === codigoElegido)
  if (!escrito || (elegido && escrito === normalizar(etiquetaAeropuerto(elegido)))) return lista
  return lista.filter(
    (a) =>
      normalizar(a.ciudad).startsWith(escrito) ||
      normalizar(a.codigoIata).startsWith(escrito) ||
      normalizar(NOMBRE_ORIGEN[a.codigoIata] ?? '').startsWith(escrito),
  )
}

// Mensaje de lo que falta o esta mal en la busqueda ('' si se puede buscar).
export const problemaEnBusqueda = ({ viaje, filtros, textoOrigen, textoDestino }) => {
  if (textoOrigen && !filtros.origen) return 'Elegí un origen de la lista: Aeroparque (AEP) o Ezeiza (EZE).'
  if (textoDestino && !filtros.destino) return 'Elegí un destino de la lista.'
  if (!filtros.origen || !filtros.destino) return 'Elegí el origen y el destino para buscar vuelos.'
  if (!filtros.ida || (viaje === 'idavuelta' && !filtros.vuelta)) {
    return viaje === 'idavuelta'
      ? 'Elegí la fecha de ida y la de vuelta para buscar vuelos.'
      : 'Elegí la fecha de ida para buscar vuelos.'
  }
  if (viaje === 'idavuelta' && filtros.vuelta < filtros.ida) return 'La fecha de vuelta tiene que ser después de la ida.'
  return ''
}

export const urlDeBusqueda = (viaje, filtros, pasajeros) => {
  const params = new URLSearchParams()
  if (viaje === 'idavuelta') params.set('viaje', 'idavuelta')
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (clave === 'vuelta' && viaje !== 'idavuelta') return
    if (valor) params.set(clave, valor)
  })
  if (textoPasajeros(pasajeros) !== textoPasajeros(SIN_PASAJEROS_EXTRA)) {
    params.set('adultos', pasajeros.adultos)
    params.set('ninos', pasajeros.ninos)
    params.set('bebes', pasajeros.bebes)
  }
  return `/vuelos?${params.toString()}`
}

// Fecha del buscador partida como en un pasaje: el dia grande y abajo el mes y el dia de
// la semana ('2026-07-10' -> { dia: '10', detalle: 'jul · vie' }). Vacio si no hay fecha.
export const partesDeFecha = (fecha) => {
  if (!fecha) return null
  const dia = new Date(`${fecha}T12:00:00`)
  const mes = dia.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  const semana = dia.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')
  return { dia: fecha.slice(8, 10), detalle: `${mes} · ${semana}` }
}
