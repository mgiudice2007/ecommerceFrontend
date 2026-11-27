import { hoy, paraInputFechaHora } from './formato'

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

// El cartel del descuento siempre dice cuánto se ahorra en porcentaje ("15% OFF"). Si el descuento es un
// monto fijo, el porcentaje se calcula sobre la clase más barata, que es el precio "desde" de la tarjeta.
export const textoDescuento = (vuelo) => {
  const descuento = vuelo.descuentoVigente
  if (!descuento) return null
  if (descuento.tipoDescuento === 'PORCENTAJE') return `${Math.round(Number(descuento.valor))}% OFF`

  const desde = precioDesde(vuelo)
  if (!desde.precio || desde.precioConDescuento >= desde.precio) return null
  const porcentaje = Math.max(1, Math.round((1 - desde.precioConDescuento / desde.precio) * 100))
  return `${porcentaje}% OFF`
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

export const cuerpoVuelo = (datos) => {
  const cuerpo = { ...datos, categoriaId: Number(datos.categoriaId) }
  delete cuerpo.tramo
  return cuerpo
}

export const asientosDe = (vuelo) =>
  vuelo.disponibilidades.reduce(
    (cuenta, d) => ({
      totales: cuenta.totales + d.asientosTotales,
      vendidos: cuenta.vendidos + (d.asientosTotales - d.asientosDisponibles),
    }),
    { totales: 0, vendidos: 0 },
  )

// Por que un vuelo no se puede comprar ('' si se puede).
export const motivoSinVenta = (vuelo) => {
  if (new Date(vuelo.fechaSalida) < new Date()) return 'Este vuelo ya salió.'
  if (!estaOperativo(vuelo)) return `Este vuelo está ${textoEstado(vuelo.estado).toLowerCase()} y no está a la venta.`
  if (!vuelo.hayStock) return 'No quedan asientos en este vuelo.'
  return ''
}

export const FORM_VUELO_VACIO = {
  tramo: 'ida',
  numeroVuelo: '',
  descripcion: '',
  categoriaId: '',
  origenIata: '',
  destinoIata: '',
  fechaSalida: '',
  fechaLlegada: '',
}

// Los datos de un vuelo existente, con la forma que usa el formulario.
export const datosDeVuelo = (vuelo) => ({
  tramo: ['AEP', 'EZE'].includes(vuelo.origenIata) ? 'ida' : 'vuelta',
  numeroVuelo: vuelo.numeroVuelo,
  descripcion: vuelo.descripcion ?? '',
  categoriaId: String(vuelo.categoriaId),
  origenIata: vuelo.origenIata,
  destinoIata: vuelo.destinoIata,
  fechaSalida: paraInputFechaHora(vuelo.fechaSalida),
  fechaLlegada: paraInputFechaHora(vuelo.fechaLlegada),
})
