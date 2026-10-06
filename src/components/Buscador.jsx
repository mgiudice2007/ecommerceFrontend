import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalogo } from '../hooks/useCatalogo'
import './Buscador.css'

// Buscador de vuelos. Usa los filtros que acepta GET /api/vuelos:
// origen, destino, categoriaId y claseId.
// Con "Ida y vuelta" la pagina de resultados busca dos veces: la ida (origen -> destino)
// y la vuelta (destino -> origen).
// inicial: los filtros con los que arranca (por ejemplo, los que ya estan en la URL)
function Buscador({ inicial = {} }) {
  const { aeropuertos, categorias, clases } = useCatalogo()
  const navigate = useNavigate()

  const [viaje, setViaje] = useState(inicial.viaje ?? 'idavuelta')
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    categoriaId: inicial.categoriaId ?? '',
    claseId: inicial.claseId ?? '',
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

    // Pasamos a la URL solo los filtros que se completaron: /vuelos?origen=AEP&destino=BRC&viaje=idavuelta
    const params = new URLSearchParams()
    if (viaje === 'idavuelta') params.set('viaje', 'idavuelta')
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor)
    })
    navigate(`/vuelos?${params.toString()}`)
  }

  return (
    <form className="buscador tarjeta" onSubmit={handleSubmit}>
      <div className="buscador-viaje" role="radiogroup" aria-label="Tipo de viaje">
        {[
          { valor: 'idavuelta', texto: '⇄ Ida y vuelta' },
          { valor: 'ida', texto: '→ Solo ida' },
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
            {opcion.texto}
          </label>
        ))}
        {error && <span className="buscador-error">{error}</span>}
      </div>

      <div className="buscador-ruta">
        <div className="buscador-campo">
          <label htmlFor="origen">Origen</label>
          <select id="origen" name="origen" value={filtros.origen} onChange={handleChange}>
            <option value="">Cualquier origen</option>
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
          <label htmlFor="destino">Destino</label>
          <select id="destino" name="destino" value={filtros.destino} onChange={handleChange}>
            <option value="">Cualquier destino</option>
            {aeropuertos.map((a) => (
              <option key={a.codigoIata} value={a.codigoIata}>
                {a.ciudad} ({a.codigoIata})
              </option>
            ))}
          </select>
        </div>
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

      <div className="buscador-campo">
        <label htmlFor="claseId">Clase</label>
        <select id="claseId" name="claseId" value={filtros.claseId} onChange={handleChange}>
          <option value="">Todas</option>
          {clases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <button className="boton boton-primario buscador-boton">Buscar vuelos</button>
    </form>
  )
}

export default Buscador
