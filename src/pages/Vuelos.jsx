import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/api'
import Buscador from '../components/Buscador'
import TarjetaVuelo from '../components/TarjetaVuelo'
import './Vuelos.css'

const POR_PAGINA = 10

function Vuelos() {
  // Los filtros viven en la URL (/vuelos?origen=EZE&destino=MAD) asi se pueden
  // compartir o volver atras con el navegador y la busqueda se mantiene.
  const [searchParams, setSearchParams] = useSearchParams()
  const pagina = Number(searchParams.get('page') ?? 0)

  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [precios, setPrecios] = useState({
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
  })

  // Cada vez que cambian los filtros de la URL, se vuelve a pedir al backend
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pagina)
    params.set('size', POR_PAGINA)

    setCargando(true)
    setError('')
    api(`/api/vuelos?${params.toString()}`)
      .then(setResultado)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [searchParams, pagina])

  const cambiarFiltro = (cambios) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor === '' || valor === null) params.delete(clave)
      else params.set(clave, valor)
    })
    setSearchParams(params)
  }

  const aplicarPrecios = (e) => {
    e.preventDefault()
    cambiarFiltro({ ...precios, page: null })
  }

  const limpiarPrecios = () => {
    setPrecios({ precioMin: '', precioMax: '' })
    cambiarFiltro({ precioMin: null, precioMax: null, page: null })
  }

  const filtrosIniciales = {
    origen: searchParams.get('origen') ?? '',
    destino: searchParams.get('destino') ?? '',
    categoriaId: searchParams.get('categoriaId') ?? '',
    claseId: searchParams.get('claseId') ?? '',
  }

  return (
    <div className="contenedor pagina">
      <h1 className="vuelos-titulo">Buscar vuelos</h1>

      {/* La key hace que el buscador se reinicie con los filtros nuevos si cambia la URL */}
      <Buscador key={searchParams.toString()} inicial={filtrosIniciales} />

      <div className="vuelos-layout">
        <aside className="tarjeta vuelos-filtros">
          <h2>Filtrar por precio</h2>
          <form onSubmit={aplicarPrecios}>
            <div className="campo">
              <label htmlFor="precioMin">Precio mínimo</label>
              <input
                id="precioMin"
                type="number"
                min="0"
                value={precios.precioMin}
                onChange={(e) => setPrecios({ ...precios, precioMin: e.target.value })}
                placeholder="$ 0"
              />
            </div>
            <div className="campo">
              <label htmlFor="precioMax">Precio máximo</label>
              <input
                id="precioMax"
                type="number"
                min="0"
                value={precios.precioMax}
                onChange={(e) => setPrecios({ ...precios, precioMax: e.target.value })}
                placeholder="Sin límite"
              />
            </div>
            <p className="vuelos-aclaracion">Se compara con el precio base del vuelo, sin descuentos.</p>
            <button className="boton boton-primario boton-ancho">Aplicar</button>
            <button type="button" className="boton boton-secundario boton-ancho" onClick={limpiarPrecios}>
              Limpiar
            </button>
          </form>
        </aside>

        <section>
          {error && <div className="mensaje mensaje-error">{error}</div>}

          {cargando && <p className="texto-suave">Buscando vuelos…</p>}

          {!cargando && resultado && (
            <>
              <p className="vuelos-cantidad">
                {resultado.totalElements === 1
                  ? '1 vuelo encontrado'
                  : `${resultado.totalElements} vuelos encontrados`}
              </p>

              {resultado.content.length === 0 && (
                <div className="tarjeta vuelos-vacio">
                  <h3>No encontramos vuelos con esos filtros</h3>
                  <p className="texto-suave">Probá con otro origen o destino, o sacá algún filtro.</p>
                </div>
              )}

              <div className="vuelos-lista">
                {resultado.content.map((vuelo) => (
                  <TarjetaVuelo key={vuelo.id} vuelo={vuelo} />
                ))}
              </div>

              {resultado.totalPages > 1 && (
                <nav className="vuelos-paginas" aria-label="Páginas de resultados">
                  <button
                    className="boton boton-secundario"
                    disabled={resultado.first}
                    onClick={() => cambiarFiltro({ page: pagina - 1 })}
                  >
                    ← Anterior
                  </button>
                  <span>
                    Página {pagina + 1} de {resultado.totalPages}
                  </span>
                  <button
                    className="boton boton-secundario"
                    disabled={resultado.last}
                    onClick={() => cambiarFiltro({ page: pagina + 1 })}
                  >
                    Siguiente →
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default Vuelos
