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
