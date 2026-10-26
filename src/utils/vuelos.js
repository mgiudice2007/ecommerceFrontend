import { hoy } from './formato'

export const precioDesde = (vuelo) => {
  const conStock = (vuelo.disponibilidades ?? []).filter((d) => d.hayStock)
  if (conStock.length === 0) {
    return { precio: vuelo.precio, precioConDescuento: vuelo.precioConDescuento }
  }
  return conStock.reduce((masBarata, d) =>
    d.precioConDescuento < masBarata.precioConDescuento ? d : masBarata,
  )
}

export const ESTADOS_VUELO = [
  { valor: 'ACTIVO', texto: 'Activo' },
  { valor: 'DEMORADO', texto: 'Demorado' },
  { valor: 'PAUSADO', texto: 'Pausado' },
  { valor: 'CANCELADO', texto: 'Cancelado' },
]

export const textoEstado = (estado) => ESTADOS_VUELO.find((e) => e.valor === estado)?.texto ?? estado

export const estaOperativo = (vuelo) => vuelo.estado === 'ACTIVO' || vuelo.estado === 'DEMORADO'

export const textoDescuento = (descuento, formatearPrecio) => {
  if (!descuento) return null
  return descuento.tipoDescuento === 'PORCENTAJE'
    ? `${Number(descuento.valor)}% OFF`
    : `${formatearPrecio(descuento.valor)} OFF`
}

export const problemaEnVuelo = (datos) => {
  if (!datos.fechaSalida || !datos.fechaLlegada) return 'Completá la fecha de salida y la de llegada'
  if (datos.origenIata === datos.destinoIata) return 'El origen y el destino tienen que ser distintos'
  if (datos.fechaSalida.slice(0, 10) < hoy()) return 'La salida no puede ser un día que ya pasó'
  if (datos.fechaLlegada <= datos.fechaSalida) return 'La llegada tiene que ser después de la salida'
  const minutos = (new Date(datos.fechaLlegada) - new Date(datos.fechaSalida)) / 60000
  if (minutos < 30) return 'El vuelo tiene que durar al menos 30 minutos'
  if (minutos > 20 * 60) return 'Un vuelo directo no puede durar más de 20 horas: revisá la fecha de llegada'
  return ''
}

export const cuerpoVuelo = (datos) => ({ ...datos, categoriaId: Number(datos.categoriaId) })
