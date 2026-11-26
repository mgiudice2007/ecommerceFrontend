export const REGIONES = [
  { categoria: 'Regional', titulo: 'América y el Caribe' },
  { categoria: 'Internacional', titulo: 'Europa' },
]

export const ATAJOS = [
  { origen: 'AEP', destino: 'BRC', texto: 'Bariloche' },
  { origen: 'AEP', destino: 'IGR', texto: 'Iguazú' },
  { origen: 'EZE', destino: 'MIA', texto: 'Miami' },
  { origen: 'EZE', destino: 'MAD', texto: 'Madrid' },
]

const unoPorDestino = (lista) =>
  lista.filter((vuelo, i) => lista.findIndex((v) => v.destinoIata === vuelo.destinoIata) === i)

export const ofertasDe = (vuelos) =>
  unoPorDestino(vuelos.filter((v) => v.descuentoVigente))
    .sort((a, b) => b.descuentoVigente.valor - a.descuentoVigente.valor)
    .slice(0, 4)

export const argentinaDe = (vuelos) => unoPorDestino(vuelos.filter((v) => v.categoriaNombre === 'Cabotaje')).slice(0, 8)

export const mundoDe = (vuelos, region) =>
  unoPorDestino(vuelos.filter((v) => v.categoriaNombre === region)).slice(0, 8)

// Los vuelos cuya portada hay que pedir: los que se muestran en la pagina de inicio.
export const destinosMostrados = (vuelos) => [
  ...ofertasDe(vuelos),
  ...argentinaDe(vuelos),
  ...REGIONES.flatMap((r) => mundoDe(vuelos, r.categoria)),
]

// En el sello de las tarjetas de destino entran hasta 9 letras.
// Las ciudades con nombre largo usan la forma corta de siempre.
const LARGO_SELLO = 9
const NOMBRES_CORTOS = {
  'Buenos Aires': 'Bs As',
  'Santiago de Chile': 'Santiago',
  'Río de Janeiro': 'Río',
  'Puerto Iguazú': 'Iguazú',
  'Mar del Plata': 'Mardel',
  'El Calafate': 'Calafate',
  'Punta Cana': 'Pta Cana',
  'Nueva York': 'NY',
}

// Nombre para el sello: el corto si lo tiene; si no, el nombre si entra; si no, su
// ultima palabra si entra; y si tampoco, las primeras letras (sin puntos suspensivos)
export const nombreParaSello = (ciudad = '') => {
  if (NOMBRES_CORTOS[ciudad]) return NOMBRES_CORTOS[ciudad]
  if (ciudad.length <= LARGO_SELLO) return ciudad
  const ultima = ciudad.split(' ').pop()
  return ultima.length <= LARGO_SELLO ? ultima : ciudad.slice(0, LARGO_SELLO)
}
