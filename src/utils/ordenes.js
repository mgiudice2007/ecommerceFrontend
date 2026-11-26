import { fechaLarga, hora } from './formato'

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

export const textoNumerosDeVuelo = (orden) => `${rotuloVuelos(orden)} ${numerosDeVuelo(orden).join(' · ')}`

// Sellos del pasaporte: un sello por cada destino de las compras confirmadas, con la
// fecha del primer viaje a ese destino (si viajaste 3 veces a Buenos Aires, es un solo
// sello). El codigo del aeropuerto sale del catalogo; si no se encuentra, se usan las 3
// primeras letras de la ciudad.
export const sellosDeViaje = (ordenes, aeropuertos) => {
  const porDestino = {}
  ;(ordenes ?? [])
    .filter((orden) => orden.estado === 'CONFIRMADA')
    .forEach((orden) =>
      orden.items.forEach((item) => {
        const anterior = porDestino[item.destino]
        if (anterior && anterior.fecha <= item.fechaSalida) return
        const aeropuerto = aeropuertos.find((a) => a.ciudad === item.destino)
        porDestino[item.destino] = {
          clave: item.destino,
          iata: aeropuerto?.codigoIata ?? item.destino.slice(0, 3).toUpperCase(),
          ciudad: item.destino,
          fecha: item.fechaSalida,
        }
      }),
    )
  return Object.values(porDestino).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

// La proxima compra confirmada cuyo vuelo todavia no salio (para la cuenta regresiva)
export const proximoVuelo = (ordenes, ahora = Date.now()) => {
  let proximo = null
  ;(ordenes ?? [])
    .filter((orden) => orden.estado === 'CONFIRMADA')
    .forEach((orden) =>
      orden.items.forEach((item) => {
        const salida = new Date(item.fechaSalida).getTime()
        if (salida > ahora && (!proximo || salida < proximo.salida)) {
          proximo = { salida, destino: item.destino, numeroVuelo: item.numeroVuelo, ordenId: orden.id }
        }
      }),
    )
  return proximo
}

// En que momento esta una compra:
// - 'cancelada': se cancelo
// - 'realizada': confirmada y todos sus vuelos ya salieron
// - 'proxima': confirmada y le queda al menos un vuelo por salir
export const momentoDeCompra = (orden, ahora = Date.now()) => {
  if (orden.estado === 'CANCELADA') return 'cancelada'
  const quedaAlguno = orden.items.some((item) => new Date(item.fechaSalida).getTime() > ahora)
  return quedaAlguno ? 'proxima' : 'realizada'
}

// Salida del primer vuelo de la compra (para ordenar los proximos viajes por fecha)
const primeraSalida = (orden) => Math.min(...orden.items.map((item) => new Date(item.fechaSalida).getTime()))

// Separa las compras en proximos viajes (el mas cercano primero), viajes realizados y
// canceladas (las mas nuevas primero)
export const comprasPorMomento = (ordenes, ahora = Date.now()) => {
  const grupos = { proxima: [], realizada: [], cancelada: [] }
  ;(ordenes ?? []).forEach((orden) => grupos[momentoDeCompra(orden, ahora)].push(orden))
  grupos.proxima.sort((a, b) => primeraSalida(a) - primeraSalida(b))
  grupos.realizada.sort((a, b) => primeraSalida(b) - primeraSalida(a))
  return grupos
}

// Si el vuelo de un tramo ya salio (en Mis compras se muestra apagado, con "Ya volo")
export const tramoYaSalio = (item, ahora = Date.now()) => new Date(item.fechaSalida).getTime() <= ahora
