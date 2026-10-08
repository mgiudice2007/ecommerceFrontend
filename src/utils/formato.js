// Funciones chicas para mostrar los datos que vienen del backend.

const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export const precio = (valor) => formatoPrecio.format(Number(valor ?? 0))

// El backend manda fechas como "2026-12-15T10:00:00"
export const hora = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })

export const fechaCorta = (fecha) =>
  new Date(fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

// "Domingo 1 de noviembre"
export const fechaConDia = (fecha) => {
  const texto = new Date(fecha)
    .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Cuantos dias despues de la salida llega el vuelo (0 si llega el mismo dia)
export const diasHastaLlegada = (salida, llegada) => {
  const dia = (fecha) => new Date(fecha.slice(0, 10)).getTime()
  return Math.round((dia(llegada) - dia(salida)) / 86_400_000)
}

export const fechaLarga = (fecha) =>
  new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

export const duracion = (minutos) => {
  if (!minutos) return ''
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

// Para los <input type="datetime-local"> hace falta "2026-12-15T10:00"
export const paraInputFechaHora = (fecha) => (fecha ? fecha.slice(0, 16) : '')

// Fecha de hoy como "2026-10-01" en horario local (toISOString usaria UTC
// y a la noche en Argentina ya daria el dia siguiente)
export const hoy = () => sumarDias(null, 0)

// Suma (o resta) dias a una fecha "2026-10-01" y la devuelve en el mismo formato
export const sumarDias = (fecha, dias) => {
  const d = fecha ? new Date(`${fecha}T12:00:00`) : new Date()
  d.setDate(d.getDate() + dias)
  const dosDigitos = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

// Cantidad de millas con separador de miles: 150000 -> "150.000"
export const millas = (cantidad) => Number(cantidad ?? 0).toLocaleString('es-AR')
