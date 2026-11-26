// El cielo del inicio cambia segun la hora real de quien entra a la pagina:
// amanecer -> tarde (el dia) -> atardecer -> noche
export const MOMENTOS = {
  amanecer: { emoji: '🌅', nombre: 'Amanecer' },
  tarde: { emoji: '☀', nombre: 'Día' },
  atardecer: { emoji: '🌇', nombre: 'Atardecer' },
  noche: { emoji: '🌙', nombre: 'Noche' },
}

export const momentoDelDia = (fecha = new Date()) => {
  const hora = fecha.getHours()
  if (hora >= 6 && hora < 10) return 'amanecer'
  if (hora >= 10 && hora < 18) return 'tarde'
  if (hora >= 18 && hora < 20) return 'atardecer'
  return 'noche'
}

// El saludo va por la hora, no por el cielo: a las 11 es de dia pero todavia es "Buen dia"
export const saludoDe = (fecha = new Date()) => {
  const hora = fecha.getHours()
  if (hora >= 6 && hora < 12) return 'Buen día'
  if (hora >= 12 && hora < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Si el cielo se fuerza desde la URL (para la demo), el saludo acompaña a ese cielo
export const SALUDO_FORZADO = {
  amanecer: 'Buen día',
  tarde: 'Buenas tardes',
  atardecer: 'Buenas tardes',
  noche: 'Buenas noches',
}
