// Parametros de la URL que describen el viaje que se esta armando (ida y vuelta).
const copiar = (desde, hacia, claves) => {
  for (const clave of claves) {
    if (desde.get(clave)) hacia.set(clave, desde.get(clave))
  }
}

const pasajerosEnUrl = (params, pasajeros) => {
  params.set('adultos', pasajeros.adultos)
  params.set('ninos', pasajeros.ninos)
  params.set('bebes', pasajeros.bebes)
}

export const urlParaElegirVuelta = (searchParams, pasajeros) => {
  const params = new URLSearchParams()
  copiar(searchParams, params, ['viaje', 'origen', 'destino', 'ida', 'vuelta'])
  pasajerosEnUrl(params, pasajeros)
  params.set('tramo', 'vuelta')
  return `/vuelos?${params.toString()}`
}

// Vuelve al mismo vuelo (con lo ya elegido) despues de iniciar sesion.
export const urlTrasLogin = (ruta, searchParams, pasajeros, claseId, asientos) => {
  const params = new URLSearchParams()
  pasajerosEnUrl(params, pasajeros)
  if (claseId) params.set('clase', claseId)
  if (asientos.length > 0) params.set('asientos', asientos.join(','))
  copiar(searchParams, params, ['viaje', 'origen', 'destino', 'ida', 'vuelta', 'tramo'])
  return `${ruta}?${params.toString()}`
}
