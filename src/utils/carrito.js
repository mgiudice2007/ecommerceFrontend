import { millas } from './formato'

// Numeros de los vuelos que tienen menores pero ningun adulto en el carrito.
export const vuelosSinAdulto = (items) => {
  const numeros = []
  items.forEach((item) => {
    const hayAdulto = items.some(
      (otro) => otro.disponibilidadId === item.disponibilidadId && otro.tipoPasajero === 'ADULTO',
    )
    if (!hayAdulto && !numeros.includes(item.numeroVuelo)) numeros.push(item.numeroVuelo)
  })
  return numeros
}

// Cuanto se paga y cuanto se suma segun las millas que el usuario quiere usar.
export const calcularMillas = (carrito, usarMillas, millasElegidas) => {
  const maximo = Math.min(carrito.millasDisponibles, Math.floor(carrito.total / carrito.valorMilla))
  const escritas = Number(millasElegidas) || 0

  let problema = ''
  if (usarMillas && escritas > carrito.millasDisponibles) {
    problema = `No tenés tantas millas: tu saldo es de ${millas(carrito.millasDisponibles)}.`
  } else if (usarMillas && escritas > maximo) {
    problema = `Con ${millas(maximo)} millas ya pagás todo: no podés usar más.`
  } else if (usarMillas && (escritas < 0 || !Number.isInteger(escritas))) {
    problema = 'Escribí una cantidad entera de millas.'
  }

  const aUsar = usarMillas && !problema ? escritas : 0
  const descuento = aUsar * carrito.valorMilla
  const aPagar = carrito.total - descuento
  const queSuma = carrito.total > 0 ? Math.floor((carrito.millasAGanar * aPagar) / carrito.total) : 0

  return { maximo, problema, aUsar, descuento, aPagar, queSuma }
}

export const textoCantidadPasajes = (cantidad) => {
  if (cantidad === 0) return 'Todavía no agregaste pasajes.'
  return `${cantidad} ${cantidad === 1 ? 'pasaje listo' : 'pasajes listos'} para comprar.`
}

