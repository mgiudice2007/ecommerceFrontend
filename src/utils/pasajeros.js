// Tipos de pasajero, iguales a los del backend (TipoPasajero).
// porcentaje: cuanto paga sobre el precio de un adulto.
export const TIPOS_PASAJERO = [
  { tipo: 'ADULTO', clave: 'adultos', titulo: 'Adultos', detalle: '12 o más años', porcentaje: 100, singular: 'adulto' },
  { tipo: 'NINO', clave: 'ninos', titulo: 'Niños', detalle: 'De 2 a 11 años · pagan 75%', porcentaje: 75, singular: 'niño' },
  { tipo: 'BEBE', clave: 'bebes', titulo: 'Bebés', detalle: 'Menores de 2 años · pagan 10%', porcentaje: 10, singular: 'bebé' },
]

export const MAXIMO_PASAJEROS = 9 // como en las aerolineas, hasta 9 por reserva

export const SIN_PASAJEROS_EXTRA = { adultos: 1, ninos: 0, bebes: 0 }

// Lee los pasajeros de la URL (?adultos=2&ninos=1); si no estan, 1 adulto
export const leerPasajeros = (searchParams) => ({
  adultos: Number(searchParams.get('adultos') ?? 1),
  ninos: Number(searchParams.get('ninos') ?? 0),
  bebes: Number(searchParams.get('bebes') ?? 0),
})

export const totalPasajeros = (pasajeros) => pasajeros.adultos + pasajeros.ninos + pasajeros.bebes

// "2 adultos, 1 niño"
export const textoPasajeros = (pasajeros) =>
  TIPOS_PASAJERO.filter((t) => pasajeros[t.clave] > 0)
    .map((t) => {
      const cantidad = pasajeros[t.clave]
      const nombre = cantidad === 1 ? t.singular : t.titulo.toLowerCase()
      return `${cantidad} ${nombre}`
    })
    .join(', ')

// Para mostrar el tipo que viene del backend: "NINO" -> "Niño"
export const nombreTipo = (tipo) => {
  const encontrado = TIPOS_PASAJERO.find((t) => t.tipo === tipo) ?? TIPOS_PASAJERO[0]
  return encontrado.singular.charAt(0).toUpperCase() + encontrado.singular.slice(1)
}
