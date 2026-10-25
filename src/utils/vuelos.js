import { hoy } from './formato'

// Calculos chicos sobre un vuelo que vienen del backend (VueloResponse).

// El precio mas barato entre las clases que todavia tienen asientos:
// devuelve { precio, precioConDescuento } para poder mostrar el precio tachado.
// Si el vuelo no tiene clases cargadas, se usa el precio general del vuelo.
export const precioDesde = (vuelo) => {
  const conStock = (vuelo.disponibilidades ?? []).filter((d) => d.hayStock)
  if (conStock.length === 0) {
    return { precio: vuelo.precio, precioConDescuento: vuelo.precioConDescuento }
  }
  return conStock.reduce((masBarata, d) =>
    d.precioConDescuento < masBarata.precioConDescuento ? d : masBarata,
  )
}

// Estados que el vendedor puede elegir (ELIMINADO es la baja y va aparte).
// Mismo enum que EstadoVuelo en el backend.
export const ESTADOS_VUELO = [
  { valor: 'ACTIVO', texto: 'Activo' },
  { valor: 'DEMORADO', texto: 'Demorado' },
  { valor: 'PAUSADO', texto: 'Pausado' },
  { valor: 'CANCELADO', texto: 'Cancelado' },
]

export const textoEstado = (estado) => ESTADOS_VUELO.find((e) => e.valor === estado)?.texto ?? estado

// Igual que Vuelo.estaOperativo() en el backend: un vuelo demorado se sigue vendiendo
export const estaOperativo = (vuelo) => vuelo.estado === 'ACTIVO' || vuelo.estado === 'DEMORADO'

// "20% OFF" o "$ 5.000 OFF" segun el tipo de descuento vigente
export const textoDescuento = (descuento, formatearPrecio) => {
  if (!descuento) return null
  return descuento.tipoDescuento === 'PORCENTAJE'
    ? `${Number(descuento.valor)}% OFF`
    : `${formatearPrecio(descuento.valor)} OFF`
}

// Controles del formulario de un vuelo antes de mandarlo al backend.
// Devuelve el problema como texto, o '' si esta todo bien.
export const problemaEnVuelo = (datos) => {
  if (!datos.fechaSalida || !datos.fechaLlegada) return 'Completá la fecha de salida y la de llegada'
  if (datos.origenIata === datos.destinoIata) return 'El origen y el destino tienen que ser distintos'
  if (datos.fechaSalida.slice(0, 10) < hoy()) return 'La salida no puede ser un día que ya pasó'
  if (datos.fechaLlegada <= datos.fechaSalida) return 'La llegada tiene que ser después de la salida'
  // Igual que el backend: un vuelo directo dura entre 30 minutos y 20 horas
  const minutos = (new Date(datos.fechaLlegada) - new Date(datos.fechaSalida)) / 60000
  if (minutos < 30) return 'El vuelo tiene que durar al menos 30 minutos'
  if (minutos > 20 * 60) return 'Un vuelo directo no puede durar más de 20 horas: revisá la fecha de llegada'
  return ''
}

// El body que espera POST / PUT /api/vuelos. No lleva precio: el precio del vuelo es el
// de su clase mas barata y lo calcula el backend
export const cuerpoVuelo = (datos) => ({ ...datos, categoriaId: Number(datos.categoriaId) })
