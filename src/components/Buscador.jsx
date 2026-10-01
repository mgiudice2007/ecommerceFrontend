import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalogo } from '../hooks/useCatalogo'
import './Buscador.css'

// Buscador de vuelos. Usa los filtros que acepta GET /api/vuelos:
// origen, destino, categoriaId y claseId.
// inicial: los filtros con los que arranca (por ejemplo, los que ya estan en la URL)
function Buscador({ inicial = {} }) {
  const { aeropuertos, categorias, clases } = useCatalogo()
  const navigate = useNavigate()

  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    categoriaId: inicial.categoriaId ?? '',
    claseId: inicial.claseId ?? '',
  })

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const invertir = () => {
    setFiltros({ ...filtros, origen: filtros.destino, destino: filtros.origen })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Pasamos a la URL solo los filtros que se completaron: /vuelos?origen=EZE&destino=MAD
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor)
    })
    navigate(`/vuelos?${params.toString()}`)
  }

  return (
    <form className="buscador tarjeta" onSubmit={handleSubmit}>
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
