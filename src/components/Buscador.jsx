import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hoy } from '../utils/formato'
import { SIN_PASAJEROS_EXTRA, textoPasajeros } from '../utils/pasajeros'
import CampoFecha from './CampoFecha'
import SelectorPasajeros from './SelectorPasajeros'
import './Buscador.css'

// La aerolinea vende vuelos que salen de Buenos Aires: Aeroparque (cabotaje) y Ezeiza
// (internacionales). La vuelta se busca sola con "Ida y vuelta".
const ORIGENES = ['AEP', 'EZE']
const NOMBRE_ORIGEN = { AEP: 'Aeroparque', EZE: 'Ezeiza' }

// Lo que se ve en el campo, por ejemplo "Madrid (MAD)" o "Buenos Aires · Ezeiza (EZE)"
const etiqueta = (aeropuerto) => {
  const nombre = NOMBRE_ORIGEN[aeropuerto.codigoIata]
  return nombre
    ? `${aeropuerto.ciudad} · ${nombre} (${aeropuerto.codigoIata})`
    : `${aeropuerto.ciudad} (${aeropuerto.codigoIata})`
}

// Busca el aeropuerto que corresponde a lo que escribio el usuario ("Madrid (MAD)" o "MAD")
const buscarAeropuerto = (lista, texto) =>
  lista.find(
    (a) =>
      etiqueta(a).toLowerCase() === texto.trim().toLowerCase() ||
      a.codigoIata.toLowerCase() === texto.trim().toLowerCase(),
  )

// Buscador de vuelos. Usa los filtros que acepta GET /api/vuelos:
// origen, destino y las fechas. La clase se elige despues, en el detalle del vuelo.
// Con "Ida y vuelta" la pagina de resultados busca dos veces: la ida (origen -> destino)
// y la vuelta (destino -> origen).
// inicial: los filtros con los que arranca (por ejemplo, los que ya estan en la URL)
// aeropuertos: el catalogo para Desde y Hacia. El buscador no lo pide: lo trae la
// pantalla que lo usa (Inicio o Vuelos) y se lo pasa por props.
function Buscador({ inicial = {}, aeropuertos = [] }) {
  const navigate = useNavigate()

  const [viaje, setViaje] = useState(inicial.viaje ?? 'idavuelta')
  const [pasajeros, setPasajeros] = useState(inicial.pasajeros ?? SIN_PASAJEROS_EXTRA)
  const [verPasajeros, setVerPasajeros] = useState(false) // desplegable de pasajeros abierto
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    ida: inicial.ida ?? '',
    vuelta: inicial.vuelta ?? '',
  })

  // Lo que esta escrito en "Desde" y "Hacia". null = todavia no escribio nada y se
  // muestra el aeropuerto que venia en los filtros (por ejemplo desde la URL)
  const [textos, setTextos] = useState({ origen: null, destino: null })

  const origenes = aeropuertos.filter((a) => ORIGENES.includes(a.codigoIata))
  // Como en las aerolineas de Buenos Aires: Aeroparque vuela dentro de Argentina y Ezeiza
  // al exterior. Sin origen elegido se ofrecen todos los destinos.
  const destinos = aeropuertos.filter((a) => {
    if (ORIGENES.includes(a.codigoIata)) return false
    if (filtros.origen === 'AEP') return a.pais === 'Argentina'
    if (filtros.origen === 'EZE') return a.pais !== 'Argentina'
    return true
  })

  const textoDe = (campo, lista) => {
    if (textos[campo] !== null) return textos[campo]
    const aeropuerto = lista.find((a) => a.codigoIata === filtros[campo])
    return aeropuerto ? etiqueta(aeropuerto) : ''
  }

  const cambiarFecha = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor })
    setError('')
  }

  // Al escribir en "Desde" o "Hacia": si lo escrito coincide con un aeropuerto, queda elegido
  const escribir = (campo, lista, texto) => {
    const aeropuerto = buscarAeropuerto(lista, texto)
    const nuevos = { ...filtros, [campo]: aeropuerto ? aeropuerto.codigoIata : '' }
    if (campo === 'origen') nuevos.destino = '' // cambia el origen: hay que volver a elegir el destino
    setFiltros(nuevos)
    setTextos(campo === 'origen' ? { origen: texto, destino: '' } : { ...textos, destino: texto })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (textoDe('origen', origenes) && !filtros.origen) {
      setError('Elegí un origen de la lista: Aeroparque (AEP) o Ezeiza (EZE).')
      return
    }
    if (textoDe('destino', destinos) && !filtros.destino) {
      setError('Elegí un destino de la lista.')
      return
    }

    if (!filtros.origen || !filtros.destino) {
      setError('Elegí el origen y el destino para buscar vuelos.')
      return
    }
    // Las fechas son obligatorias: la de ida siempre y la de vuelta si es ida y vuelta
    if (!filtros.ida || (viaje === 'idavuelta' && !filtros.vuelta)) {
      setError(
        viaje === 'idavuelta'
          ? 'Elegí la fecha de ida y la de vuelta para buscar vuelos.'
          : 'Elegí la fecha de ida para buscar vuelos.',
      )
      return
    }
    if (viaje === 'idavuelta' && filtros.ida && filtros.vuelta && filtros.vuelta < filtros.ida) {
      setError('La fecha de vuelta tiene que ser después de la ida.')
      return
    }

    // Pasamos a la URL solo los filtros que se completaron: /vuelos?origen=AEP&destino=BRC&ida=2026-10-20
    const params = new URLSearchParams()
    if (viaje === 'idavuelta') params.set('viaje', 'idavuelta')
    Object.entries(filtros).forEach(([clave, valor]) => {
      // La fecha de vuelta solo sirve si el viaje es de ida y vuelta
      if (clave === 'vuelta' && viaje !== 'idavuelta') return
      if (valor) params.set(clave, valor)
    })
    // Los pasajeros van a la URL solo si no es el caso comun (1 adulto)
    if (textoPasajeros(pasajeros) !== textoPasajeros(SIN_PASAJEROS_EXTRA)) {
      params.set('adultos', pasajeros.adultos)
      params.set('ninos', pasajeros.ninos)
      params.set('bebes', pasajeros.bebes)
    }
    navigate(`/vuelos?${params.toString()}`)
  }

  return (
    <form className="buscador tarjeta" onSubmit={handleSubmit}>
      <div className="buscador-cabecera">
        <h2>¿A dónde querés ir?</h2>
        <div className="buscador-viaje" role="radiogroup" aria-label="Tipo de viaje">
          {[
            { valor: 'idavuelta', texto: 'Ida y vuelta' },
            { valor: 'ida', texto: 'Solo ida' },
          ].map((opcion) => (
            <label key={opcion.valor} className={viaje === opcion.valor ? 'activo' : ''}>
              <input
                type="radio"
                name="viaje"
                value={opcion.valor}
                checked={viaje === opcion.valor}
                onChange={() => {
                  setViaje(opcion.valor)
                  setError('')
                }}
              />
              {viaje === opcion.valor && <span aria-hidden="true">✓ </span>}
              {opcion.texto}
            </label>
          ))}
        </div>
      </div>

      {/* Se puede escribir (por ejemplo "mad") y el navegador sugiere las opciones de la lista (datalist) */}
      <div className="buscador-ruta">
        <div className="buscador-campo">
          <label htmlFor="origen">Desde</label>
          <input
            id="origen"
            list="lista-origenes"
            value={textoDe('origen', origenes)}
            onChange={(e) => escribir('origen', origenes, e.target.value)}
            placeholder="Aeroparque o Ezeiza"
            autoComplete="off"
          />
          <datalist id="lista-origenes">
            {origenes.map((a) => (
              <option key={a.codigoIata} value={etiqueta(a)}>
                {a.codigoIata === 'AEP' ? 'Vuelos de cabotaje' : 'Vuelos internacionales'}
              </option>
            ))}
          </datalist>
        </div>

        <div className="buscador-campo">
          <label htmlFor="destino">Hacia</label>
          <input
            id="destino"
            list="lista-destinos"
            value={textoDe('destino', destinos)}
            onChange={(e) => escribir('destino', destinos, e.target.value)}
            placeholder="Escribí un destino"
            autoComplete="off"
          />
          <datalist id="lista-destinos">
            {destinos.map((a) => (
              <option key={a.codigoIata} value={etiqueta(a)}>
                {a.pais}
              </option>
            ))}
          </datalist>
        </div>
      </div>

      {/* Fechas y pasajeros en la misma fila */}
      <div className="buscador-fila">
        {/* CampoFecha muestra siempre dd/mm/aaaa; min no deja elegir dias pasados */}
        <div className="buscador-fechas">
          <div className="buscador-campo">
            <label htmlFor="ida">Ida</label>
            <CampoFecha id="ida" min={hoy()} value={filtros.ida} onChange={(valor) => cambiarFecha('ida', valor)} />
          </div>
          {viaje === 'idavuelta' && (
            <div className="buscador-campo">
              <label htmlFor="vuelta">Vuelta</label>
              <CampoFecha
                id="vuelta"
                min={filtros.ida || hoy()}
                value={filtros.vuelta}
                onChange={(valor) => cambiarFecha('vuelta', valor)}
              />
            </div>
          )}
        </div>

        <div className="buscador-campo buscador-pasajeros">
          <label htmlFor="pasajeros">Pasajeros</label>
          <button id="pasajeros" type="button" onClick={() => setVerPasajeros(!verPasajeros)} aria-expanded={verPasajeros}>
            {textoPasajeros(pasajeros)}
            <span aria-hidden="true">{verPasajeros ? '▴' : '▾'}</span>
          </button>
          {verPasajeros && (
            // Se cierra con "Listo" o tocando de nuevo el campo Pasajeros
            <div className="buscador-desplegable">
              <SelectorPasajeros pasajeros={pasajeros} onChange={setPasajeros} />
              <button type="button" className="boton boton-primario boton-ancho" onClick={() => setVerPasajeros(false)}>
                Listo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="buscador-pie">
        {error ? <span className="buscador-error">{error}</span> : <span />}
        <button className="boton boton-primario buscador-boton">
          <span aria-hidden="true">⌕</span> Buscar vuelos
        </button>
      </div>
    </form>
  )
}

export default Buscador
