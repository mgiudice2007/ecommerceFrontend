const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const precio = (valor) => formatoPrecio.format(Number(valor ?? 0))

export const precioOGratis = (valor) => (Number(valor) === 0 ? 'Gratis' : precio(valor))

export const hora = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })

export const fechaCorta = (fecha) =>
  new Date(fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

export const fechaConDia = (fecha) => {
  const texto = new Date(fecha)
    .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export const diasHastaLlegada = (salida, llegada) => {
  const dia = (fecha) => new Date(fecha.slice(0, 10)).getTime()
  return Math.round((dia(llegada) - dia(salida)) / 86_400_000)
}

// Hora de llegada con "(+1)" si se llega otro dia, como en los pasajes: "09:35" o "06:10 (+1)"
export const horaLlegada = (salida, llegada) => {
  const dias = diasHastaLlegada(salida, llegada)
  return dias > 0 ? `${hora(llegada)} (+${dias})` : hora(llegada)
}

export const fechaLarga = (fecha) =>
  new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

export const duracion = (minutos) => {
  if (!minutos) return ''
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export const paraInputFechaHora = (fecha) => (fecha ? fecha.slice(0, 16) : '')

export const hoy = () => sumarDias(null, 0)

export const sumarDias = (fecha, dias) => {
  const d = fecha ? new Date(`${fecha}T12:00:00`) : new Date()
  d.setDate(d.getDate() + dias)
  const dosDigitos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

export const millas = (cantidad) => Number(cantidad ?? 0).toLocaleString('es-AR')

// "2026-12-24" -> "24/12/2026" (un dia sin hora).
export const fechaDeDia = (fecha) => new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR')
