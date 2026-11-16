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
