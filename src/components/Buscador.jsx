import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hoy } from '../utils/formato'
import { SIN_PASAJEROS_EXTRA, textoPasajeros } from '../utils/pasajeros'
import CampoFecha from './CampoFecha'
import SelectorPasajeros from './SelectorPasajeros'
import './Buscador.css'

const ORIGENES = ['AEP', 'EZE']
const NOMBRE_ORIGEN = { AEP: 'Aeroparque', EZE: 'Ezeiza' }

const etiqueta = (aeropuerto) => {
  const nombre = NOMBRE_ORIGEN[aeropuerto.codigoIata]
  return nombre
    ? `${aeropuerto.ciudad} · ${nombre} (${aeropuerto.codigoIata})`
    : `${aeropuerto.ciudad} (${aeropuerto.codigoIata})`
}

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const buscarAeropuerto = (lista, texto) =>
  lista.find(
    (a) =>
      etiqueta(a).toLowerCase() === texto.trim().toLowerCase() ||
      a.codigoIata.toLowerCase() === texto.trim().toLowerCase(),
  )

function Buscador({ inicial = {}, aeropuertos = [] }) {
  const navigate = useNavigate()

  const [viaje, setViaje] = useState(inicial.viaje ?? 'idavuelta')
  const [pasajeros, setPasajeros] = useState(inicial.pasajeros ?? SIN_PASAJEROS_EXTRA)
  const [verPasajeros, setVerPasajeros] = useState(false)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    ida: inicial.ida ?? '',
    vuelta: inicial.vuelta ?? '',
  })

  const [textos, setTextos] = useState({ origen: null, destino: null })
  const [abierto, setAbierto] = useState(null)

  const origenes = aeropuertos.filter((a) => ORIGENES.includes(a.codigoIata))
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

  const sugerenciasDe = (campo, lista) => {
    const escrito = normalizar(textoDe(campo, lista).trim())
    const elegido = lista.find((a) => a.codigoIata === filtros[campo])
    if (!escrito || (elegido && escrito === normalizar(etiqueta(elegido)))) return lista
    return lista.filter(
      (a) =>
        normalizar(a.ciudad).startsWith(escrito) ||
        normalizar(a.codigoIata).startsWith(escrito) ||
        normalizar(NOMBRE_ORIGEN[a.codigoIata] ?? '').startsWith(escrito),
    )
  }

  const elegir = (campo, aeropuerto) => {
    const nuevos = { ...filtros, [campo]: aeropuerto.codigoIata }
    if (campo === 'origen' && filtros.origen !== aeropuerto.codigoIata) nuevos.destino = ''
    setFiltros(nuevos)
    setTextos(
      campo === 'origen' && filtros.origen !== aeropuerto.codigoIata
        ? { origen: etiqueta(aeropuerto), destino: '' }
        : { ...textos, [campo]: etiqueta(aeropuerto) },
    )
    setAbierto(null)
    setError('')
  }

  const cambiarFecha = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor })
    setError('')
  }

  const escribir = (campo, lista, texto) => {
    const aeropuerto = buscarAeropuerto(lista, texto)
    const nuevos = { ...filtros, [campo]: aeropuerto ? aeropuerto.codigoIata : '' }
    if (campo === 'origen') nuevos.destino = ''
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

    const params = new URLSearchParams()
    if (viaje === 'idavuelta') params.set('viaje', 'idavuelta')
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (clave === 'vuelta' && viaje !== 'idavuelta') return
      if (valor) params.set(clave, valor)
    })
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

      <div className="buscador-ruta">
        <div className="buscador-campo">
          <label htmlFor="origen">Desde</label>
          <input
            id="origen"
            value={textoDe('origen', origenes)}
            onChange={(e) => escribir('origen', origenes, e.target.value)}
            onFocus={() => setAbierto('origen')}
            onBlur={() => setAbierto(null)}
            placeholder="Aeroparque o Ezeiza"
            autoComplete="off"
          />
          {abierto === 'origen' && (
            <ul className="buscador-sugerencias" role="listbox">
              {sugerenciasDe('origen', origenes).map((a) => (
                <li key={a.codigoIata}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      elegir('origen', a)
                    }}
                  >
                    <strong>{etiqueta(a)}</strong>
                    <small>{a.codigoIata === 'AEP' ? 'Vuelos de cabotaje' : 'Vuelos internacionales'}</small>
                  </button>
                </li>
              ))}
              {sugerenciasDe('origen', origenes).length === 0 && (
                <li className="buscador-sin-sugerencias">Los vuelos salen de Aeroparque o Ezeiza</li>
              )}
            </ul>
          )}
        </div>

        <div className="buscador-campo">
          <label htmlFor="destino">Hacia</label>
          <input
            id="destino"
            value={textoDe('destino', destinos)}
            onChange={(e) => escribir('destino', destinos, e.target.value)}
            onFocus={() => setAbierto('destino')}
            onBlur={() => setAbierto(null)}
            placeholder="Escribí un destino"
            autoComplete="off"
          />
          {abierto === 'destino' && (
            <ul className="buscador-sugerencias" role="listbox">
              {sugerenciasDe('destino', destinos).map((a) => (
                <li key={a.codigoIata}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      elegir('destino', a)
                    }}
                  >
                    <strong>{etiqueta(a)}</strong>
                    <small>{a.pais}</small>
                  </button>
                </li>
              ))}
              {sugerenciasDe('destino', destinos).length === 0 && (
                <li className="buscador-sin-sugerencias">No hay destinos que empiecen así</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="buscador-fila">
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
