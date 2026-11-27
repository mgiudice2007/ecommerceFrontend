import barcelona from '../assets/destinos/barcelona.jpg'
import bariloche from '../assets/destinos/bariloche.jpg'
import buenosaires from '../assets/destinos/buenosaires.jpg'
import calafate from '../assets/destinos/calafate.jpg'
import cancun from '../assets/destinos/cancun.jpg'
import cordoba from '../assets/destinos/cordoba.jpg'
import iguazu from '../assets/destinos/iguazu.jpg'
import madrid from '../assets/destinos/madrid.jpg'
import mardelplata from '../assets/destinos/mardelplata.jpg'
import mendoza from '../assets/destinos/mendoza.jpg'
import miami from '../assets/destinos/miami.jpg'
import nuevayork from '../assets/destinos/nuevayork.jpg'
import puntacana from '../assets/destinos/puntacana.jpg'
import rio from '../assets/destinos/rio.jpg'
import roma from '../assets/destinos/roma.jpg'
import salta from '../assets/destinos/salta.jpg'
import santiago from '../assets/destinos/santiago.jpg'
import ushuaia from '../assets/destinos/ushuaia.jpg'

// Foto de respaldo de cada destino (las mismas fotos de ejemplo que usa el seeder del back).
// Se usa cuando el vuelo no tiene fotos propias: el seeder solo le carga foto a algunos vuelos
// para que la base no pese de mas. Si el admin le sube una foto al vuelo, se muestra esa.
const POR_CODIGO = {
  EZE: buenosaires,
  AEP: buenosaires,
  BRC: bariloche,
  IGR: iguazu,
  USH: ushuaia,
  FTE: calafate,
  SLA: salta,
  MDZ: mendoza,
  COR: cordoba,
  MDQ: mardelplata,
  GIG: rio,
  SCL: santiago,
  CUN: cancun,
  PUJ: puntacana,
  MIA: miami,
  JFK: nuevayork,
  MAD: madrid,
  BCN: barcelona,
  FCO: roma,
}

// Algunas pantallas (las compras) solo tienen el nombre de la ciudad
const POR_CIUDAD = {
  'Buenos Aires': buenosaires,
  Bariloche: bariloche,
  'Puerto Iguazú': iguazu,
  Ushuaia: ushuaia,
  'El Calafate': calafate,
  Salta: salta,
  Mendoza: mendoza,
  Córdoba: cordoba,
  'Mar del Plata': mardelplata,
  'Río de Janeiro': rio,
  'Santiago de Chile': santiago,
  Cancún: cancun,
  'Punta Cana': puntacana,
  Miami: miami,
  'Nueva York': nuevayork,
  Madrid: madrid,
  Barcelona: barcelona,
  Roma: roma,
}

export const fotoDelDestino = (codigo, ciudad) => POR_CODIGO[codigo] ?? POR_CIUDAD[ciudad] ?? null
