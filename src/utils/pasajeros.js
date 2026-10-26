export const TIPOS_PASAJERO = [
  { tipo: 'ADULTO', clave: 'adultos', titulo: 'Adultos', detalle: '+ 12 años', porcentaje: 100, singular: 'adulto' },
  { tipo: 'NINO', clave: 'ninos', titulo: 'Niños', detalle: '2 a 11 años', porcentaje: 100, singular: 'niño' },
  { tipo: 'BEBE', clave: 'bebes', titulo: 'Bebés', detalle: '0 a 23 meses · gratis', porcentaje: 0, singular: 'bebé' },
]

export const MAXIMO_PASAJEROS = 9

export const SIN_PASAJEROS_EXTRA = { adultos: 1, ninos: 0, bebes: 0 }

export const leerPasajeros = (searchParams) => ({
  adultos: Number(searchParams.get('adultos') ?? 1),
  ninos: Number(searchParams.get('ninos') ?? 0),
  bebes: Number(searchParams.get('bebes') ?? 0),
})

export const totalPasajeros = (pasajeros) => pasajeros.adultos + pasajeros.ninos + pasajeros.bebes

export const textoPasajeros = (pasajeros) =>
  TIPOS_PASAJERO.filter((t) => pasajeros[t.clave] > 0)
    .map((t) => {
      const cantidad = pasajeros[t.clave]
      const nombre = cantidad === 1 ? t.singular : t.titulo.toLowerCase()
      return `${cantidad} ${nombre}`
    })
    .join(', ')

export const nombreTipo = (tipo) => {
  const encontrado = TIPOS_PASAJERO.find((t) => t.tipo === tipo) ?? TIPOS_PASAJERO[0]
  return encontrado.singular.charAt(0).toUpperCase() + encontrado.singular.slice(1)
}
