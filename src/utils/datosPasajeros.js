import { hoy } from './formato'
import { nombreTipo } from './pasajeros'

export const TIPOS_DOCUMENTO = [
  { id: 'DNI', nombre: 'DNI' },
  { id: 'PASAPORTE', nombre: 'Pasaporte' },
]

const ORDEN_TIPOS = ['ADULTO', 'NINO', 'BEBE']

// Como en las aerolíneas: bebé hasta 1 año, niño de 2 a 11 y adulto desde los 12 (en la fecha del vuelo)
const EDADES = {
  BEBE: { desde: 0, hasta: 1, texto: 'hasta 1 año' },
  NINO: { desde: 2, hasta: 11, texto: 'de 2 a 11 años' },
  ADULTO: { desde: 12, hasta: 200, texto: 'desde los 12 años' },
}

const SOLO_LETRAS = /^\p{L}[\p{L}' -]*$/u
const DNI = /^\d{7,8}$/
const PASAPORTE = /^[A-Za-z0-9]{6,12}$/

// Una persona por lugar de cada tipo: con 2 adultos en la ida y 2 en la vuelta son las mismas 2 personas,
// así los datos se cargan una sola vez.
export const armarPersonas = (items) =>
  ORDEN_TIPOS.flatMap((tipo) => {
    const cantidad = Math.max(0, ...items.filter((item) => item.tipoPasajero === tipo).map((item) => item.cantidad))
    return Array.from({ length: cantidad }, (_, i) => ({
      clave: `${tipo}-${i + 1}`,
      tipo,
      numero: i + 1,
      nombre: '',
      apellido: '',
      tipoDocumento: 'DNI',
      documento: '',
      fechaNacimiento: '',
    }))
  })

export const tituloPersona = (persona) => `${nombreTipo(persona.tipo)} ${persona.numero}`

// Los vuelos del carrito en los que viaja esta persona
export const vuelosDe = (persona, items) =>
  items.filter((item) => item.tipoPasajero === persona.tipo && item.cantidad >= persona.numero)

// Lo que se manda al backend: una entrada por lugar, con el id del pasaje del carrito al que pertenece
export const pedidoDePasajeros = (personas, items) =>
  items.flatMap((item) =>
    Array.from({ length: item.cantidad }, (_, i) => {
      const persona = personas.find((p) => p.clave === `${item.tipoPasajero}-${i + 1}`)
      return {
        itemId: item.id,
        nombre: persona.nombre.trim(),
        apellido: persona.apellido.trim(),
        tipoDocumento: persona.tipoDocumento,
        documento: persona.documento.trim(),
        fechaNacimiento: persona.fechaNacimiento,
      }
    }),
  )

export const edadEn = (nacimiento, dia) => {
  const [anioN, mesN, diaN] = nacimiento.split('-').map(Number)
  const [anio, mes, diaV] = dia.slice(0, 10).split('-').map(Number)
  const cumplio = mes > mesN || (mes === mesN && diaV >= diaN)
  return anio - anioN - (cumplio ? 0 : 1)
}

const validarFecha = (persona, vuelos) => {
  if (!persona.fechaNacimiento) return 'La fecha de nacimiento es obligatoria'
  if (persona.fechaNacimiento >= hoy()) return 'La fecha de nacimiento tiene que ser pasada'
  const rango = EDADES[persona.tipo]
  const vueloFueraDeRango = vuelos.find((vuelo) => {
    const edad = edadEn(persona.fechaNacimiento, vuelo.fechaSalida)
    return edad < rango.desde || edad > rango.hasta
  })
  if (!vueloFueraDeRango) return ''
  const edad = Math.max(edadEn(persona.fechaNacimiento, vueloFueraDeRango.fechaSalida), 0)
  return `Tendría ${edad} años en el vuelo ${vueloFueraDeRango.numeroVuelo}: ${nombreTipo(persona.tipo).toLowerCase()} es ${rango.texto}`
}

const validarNombre = (valor, rotulo) => {
  const texto = valor.trim()
  if (!texto) return `El ${rotulo} es obligatorio`
  if (texto.length < 2 || texto.length > 40) return `El ${rotulo} tiene que tener entre 2 y 40 letras`
  if (!SOLO_LETRAS.test(texto)) return `El ${rotulo} solo puede tener letras, espacios, apóstrofo o guion`
  return ''
}

const validarDocumento = (persona) => {
  const texto = persona.documento.trim()
  if (!texto) return 'El documento es obligatorio'
  if (persona.tipoDocumento === 'DNI' && !DNI.test(texto)) return 'El DNI tiene que tener 7 u 8 números, sin puntos'
  if (persona.tipoDocumento === 'PASAPORTE' && !PASAPORTE.test(texto)) {
    return 'El pasaporte tiene que tener entre 6 y 12 letras o números'
  }
  return ''
}

// { clave: { nombre, apellido, documento, fechaNacimiento } } con solo los campos que tienen problema
export const validarPersonas = (personas, items) => {
  const errores = {}
  const vistos = {}
  personas.forEach((persona) => {
    const problemas = {
      nombre: validarNombre(persona.nombre, 'nombre'),
      apellido: validarNombre(persona.apellido, 'apellido'),
      documento: validarDocumento(persona),
      fechaNacimiento: validarFecha(persona, vuelosDe(persona, items)),
    }
    const identidad = `${persona.tipoDocumento}:${persona.documento.trim().toUpperCase()}`
    if (!problemas.documento && vistos[identidad]) problemas.documento = 'Ya cargaste este documento para otro pasajero'
    vistos[identidad] = true

    const conProblema = Object.fromEntries(Object.entries(problemas).filter(([, mensaje]) => mensaje))
    if (Object.keys(conProblema).length > 0) errores[persona.clave] = conProblema
  })
  return errores
}
