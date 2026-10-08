import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { useNavigate } from 'react-router-dom'
import { hoy } from '../utils/formato'
import { SIN_PASAJEROS_EXTRA, textoPasajeros } from '../utils/pasajeros'
import SelectorPasajeros from './SelectorPasajeros'
import './Buscador.css'

// Buscador de vuelos. Usa los filtros que acepta GET /api/vuelos:
// origen, destino, categoriaId, claseId y las fechas.
// Con "Ida y vuelta" la pagina de resultados busca dos veces: la ida (origen -> destino)
// y la vuelta (destino -> origen).
// inicial: los filtros con los que arranca (por ejemplo, los que ya estan en la URL)
function Buscador({ inicial = {} }) {
  // Datos del catalogo para los selects (si falla un pedido, ese select queda vacio)
  const [aeropuertos, setAeropuertos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [clases, setClases] = useState([])

  useEffect(() => {
    api('/api/aeropuertos')
      .then((data) => setAeropuertos(data))
      .catch(() => setAeropuertos([]))
    api('/api/categorias')
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
    api('/api/clases')
      .then((data) => setClases(data))
      .catch(() => setClases([]))
  }, [])

  const navigate = useNavigate()

  const [viaje, setViaje] = useState(inicial.viaje ?? 'idavuelta')
  const [pasajeros, setPasajeros] = useState(inicial.pasajeros ?? SIN_PASAJEROS_EXTRA)
  const [verPasajeros, setVerPasajeros] = useState(false) // desplegable de pasajeros abierto
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    categoriaId: inicial.categoriaId ?? '',
    claseId: inicial.claseId ?? '',
    ida: inicial.ida ?? '',
    vuelta: inicial.vuelta ?? '',
  })

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
    setError('')
  }

  const invertir = () => {
    setFiltros({ ...filtros, origen: filtros.destino, destino: filtros.origen })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (viaje === 'idavuelta' && (!filtros.origen || !filtros.destino)) {
      setError('Para buscar ida y vuelta elegí el origen y el destino.')
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

      <div className="buscador-ruta">
        <div className="buscador-campo">
          <label htmlFor="origen">Desde</label>
          <select id="origen" name="origen" value={filtros.origen} onChange={handleChange}>
            <option value="">Ingresá un origen</option>
            {aeropuertos.map((a) => (
              <option key={a.codigoIata} value={a.codigoIata}>
                {a.ciudad} ({a.codigoIata})
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="buscador-invertir" onClick={invertir} aria-label="Invertir origen y destino">
          ⇄
        </button>

        <div className="buscador-campo">
          <label htmlFor="destino">Hacia</label>
          <select id="destino" name="destino" value={filtros.destino} onChange={handleChange}>
            <option value="">Ingresá un destino</option>
            {aeropuertos.map((a) => (
              <option key={a.codigoIata} value={a.codigoIata}>
                {a.ciudad} ({a.codigoIata})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="buscador-fila">
        <div className="buscador-campo">
          <label htmlFor="claseId">Cabina</label>
          <select id="claseId" name="claseId" value={filtros.claseId} onChange={handleChange}>
            <option value="">Todas</option>
            {clases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* type="date" muestra el calendario del navegador; min no deja elegir dias pasados */}
        <div className="buscador-fechas">
          <div className="buscador-campo">
            <label htmlFor="ida">Ida</label>
            <input id="ida" name="ida" type="date" min={hoy()} value={filtros.ida} onChange={handleChange} />
          </div>
          {viaje === 'idavuelta' && (
            <div className="buscador-campo">
              <label htmlFor="vuelta">Vuelta</label>
              <input
                id="vuelta"
                name="vuelta"
                type="date"
                min={filtros.ida || hoy()}
                value={filtros.vuelta}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <div className="buscador-campo">
          <label htmlFor="categoriaId">Tipo de vuelo</label>
          <select id="categoriaId" name="categoriaId" value={filtros.categoriaId} onChange={handleChange}>
            <option value="">Todos</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="buscador-fila-pasajeros">
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
