// El cielo del inicio cambia segun la hora real de quien entra a la pagina
export const MOMENTOS = {
  manana: { saludo: 'Buen día', emoji: '🌤' },
  tarde: { saludo: 'Buenas tardes', emoji: '☀' },
  atardecer: { saludo: 'Atardecer en vuelo', emoji: '🌇' },
  noche: { saludo: 'Buenas noches', emoji: '🌙' },
}

export const momentoDelDia = (fecha = new Date()) => {
  const hora = fecha.getHours()
  if (hora >= 6 && hora < 12) return 'manana'
  if (hora >= 12 && hora < 18) return 'tarde'
  if (hora >= 18 && hora < 20) return 'atardecer'
  return 'noche'
}
