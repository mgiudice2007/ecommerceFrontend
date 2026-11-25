export const MEDIOS_PAGO = [
  { id: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito', detalle: 'Hasta 12 cuotas' },
  { id: 'TARJETA_DEBITO', nombre: 'Tarjeta de débito', detalle: 'Se acredita al instante' },
  { id: 'TRANSFERENCIA', nombre: 'Transferencia', detalle: 'Con alias o CBU' },
  { id: 'BILLETERA_VIRTUAL', nombre: 'Billetera virtual', detalle: 'Pagá con un código QR' },
]

export const CUOTAS = [1, 3, 6, 12]

export const DATOS_TRANSFERENCIA = {
  titular: 'BCA Airlines S.A.',
  alias: 'bca.airlines.pagos',
  cbu: '0000003100012345678901',
  cuit: '30-12345678-9',
}

export const TARJETA_INICIAL = { numero: '', titular: '', vencimiento: '', codigo: '', cuotas: '1' }

export const esTarjeta = (medio) => medio === 'TARJETA_CREDITO' || medio === 'TARJETA_DEBITO'

export const nombreMedioPago = (medio) => {
  if (medio === 'MILLAS') return 'Millas'
  return MEDIOS_PAGO.find((m) => m.id === medio)?.nombre ?? ''
}

// "Tarjeta de crédito terminada en 4242", "Transferencia"... Las compras viejas no tienen medio.
export const textoMedioPago = (orden) => {
  if (!orden.medioPago) return ''
  const nombre = nombreMedioPago(orden.medioPago)
  return orden.ultimosDigitos ? `${nombre} terminada en ${orden.ultimosDigitos}` : nombre
}

const soloDigitos = (texto) => texto.replace(/\D/g, '')

export const formatearNumeroTarjeta = (texto) =>
  soloDigitos(texto)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')

export const formatearVencimiento = (texto) => {
  const digitos = soloDigitos(texto).slice(0, 4)
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
}

// Escribir en un campo de la tarjeta: cada uno acepta solo lo que le corresponde.
export const formatearCampoTarjeta = (nombre, valor) => {
  if (nombre === 'numero') return formatearNumeroTarjeta(valor)
  if (nombre === 'vencimiento') return formatearVencimiento(valor)
  if (nombre === 'codigo') return soloDigitos(valor).slice(0, 3)
  return valor
}

export const ultimosCuatro = (numero) => soloDigitos(numero).slice(-4)

// Algoritmo de Luhn: el que usan todas las tarjetas para detectar un numero mal tipeado.
const pasaLuhn = (numero) => {
  let suma = 0
  numero
    .split('')
    .reverse()
    .forEach((caracter, i) => {
      let digito = Number(caracter)
      if (i % 2 === 1) {
        digito *= 2
        if (digito > 9) digito -= 9
      }
      suma += digito
    })
  return suma % 10 === 0
}

const vencimientoVencido = (vencimiento) => {
  const mes = Number(vencimiento.slice(0, 2))
  const anio = 2000 + Number(vencimiento.slice(3, 5))
  const ahora = new Date()
  return anio < ahora.getFullYear() || (anio === ahora.getFullYear() && mes < ahora.getMonth() + 1)
}

// Devuelve un objeto con un mensaje por cada campo que esta mal. Vacio = la tarjeta es valida.
export const validarTarjeta = (tarjeta) => {
  const errores = {}
  const numero = soloDigitos(tarjeta.numero)

  if (numero.length < 16) {
    errores.numero = 'Ingresá los 16 números de la tarjeta.'
  } else if (!pasaLuhn(numero)) {
    errores.numero = 'El número no es válido. Revisá que no tenga errores.'
  }

  if (!/^\p{L}[\p{L}' -]{2,}$/u.test(tarjeta.titular.trim())) {
    errores.titular = 'Escribí el nombre como figura en la tarjeta.'
  }

  if (!/^\d{2}\/\d{2}$/.test(tarjeta.vencimiento) || Number(tarjeta.vencimiento.slice(0, 2)) < 1 || Number(tarjeta.vencimiento.slice(0, 2)) > 12) {
    errores.vencimiento = 'Usá el formato MM/AA con un mes del 01 al 12.'
  } else if (vencimientoVencido(tarjeta.vencimiento)) {
    errores.vencimiento = 'La tarjeta está vencida.'
  }

  if (!/^\d{3}$/.test(tarjeta.codigo)) {
    errores.codigo = 'Son los 3 números del dorso.'
  }

  return errores
}
