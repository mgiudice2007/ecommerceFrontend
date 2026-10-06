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
