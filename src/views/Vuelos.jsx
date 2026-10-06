import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/api'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TarjetaVuelo from '../components/TarjetaVuelo'
import './Vuelos.css'

const POR_PAGINA = 10

// Pide una pagina de vuelos al backend con los filtros dados
const buscarVuelos = (params) => api(`/api/vuelos?${params.toString()}`)

function Vuelos() {
  // Los filtros viven en la URL (/vuelos?origen=EZE&destino=MAD) asi se pueden
  // compartir o volver atras con el navegador y la busqueda se mantiene.
  const [searchParams, setSearchParams] = useSearchParams()
  const pagina = Number(searchParams.get('page') ?? 0)

  // La busqueda actual en texto (por ejemplo "destino=MAD&page=1")
  const busqueda = searchParams.toString()

  // Guardamos la respuesta junto con la busqueda que la pidio. Asi "cargando"
  // no hace falta guardarlo: es cuando la respuesta todavia es de otra busqueda.
  const [respuesta, setRespuesta] = useState({ busqueda: null, datos: null, error: '' })
  const cargando = respuesta.busqueda !== busqueda
  const resultado = cargando ? null : respuesta.datos
  const error = cargando ? '' : respuesta.error

  const [precios, setPrecios] = useState({
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
  })

  // Ida y vuelta: hace falta saber origen y destino para buscar el regreso
  const idaYVuelta =
    searchParams.get('viaje') === 'idavuelta' && searchParams.get('origen') && searchParams.get('destino')

  // Cada vez que cambian los filtros de la URL, se vuelve a pedir al backend
  useEffect(() => {
    const params = new URLSearchParams(busqueda)
    const esIdaYVuelta = params.get('viaje') === 'idavuelta' && params.get('origen') && params.get('destino')
    params.delete('viaje') // es solo del frontend, el backend no lo conoce

    if (!esIdaYVuelta) {
      params.set('page', params.get('page') ?? 0)
      params.set('size', POR_PAGINA)
      buscarVuelos(params)
        .then((ida) => setRespuesta({ busqueda, datos: { ida, vuelta: null }, error: '' }))
        .catch((err) => setRespuesta({ busqueda, datos: null, error: err.message }))
      return
    }

    // Dos busquedas al mismo tiempo: la ida (origen -> destino) y la vuelta (destino -> origen)
    params.delete('page')
    const vuelta = new URLSearchParams(params)
    vuelta.set('origen', params.get('destino'))
    vuelta.set('destino', params.get('origen'))

    Promise.all([buscarVuelos(params), buscarVuelos(vuelta)])
      .then(([ida, regreso]) => setRespuesta({ busqueda, datos: { ida, vuelta: regreso }, error: '' }))
      .catch((err) => setRespuesta({ busqueda, datos: null, error: err.message }))
  }, [busqueda])

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
    viaje: searchParams.get('viaje') ?? 'ida',
  }

  // Una lista de resultados (se usa una vez para solo ida y dos veces para ida y vuelta)
  const listaDeVuelos = (pagina) => (
    <>
      {pagina.content.length === 0 && (
        <div className="tarjeta vuelos-vacio">
          {/* El backend manda el mensaje cuando no hay resultados */}
          <h3>{pagina.mensaje ?? 'No encontramos vuelos con esos filtros'}</h3>
          <p className="texto-suave">Probá con otro destino o sacá algún filtro.</p>
        </div>
      )}
      <div className="vuelos-lista">
        {pagina.content.map((vuelo) => (
          <TarjetaVuelo key={vuelo.id} vuelo={vuelo} />
        ))}
      </div>
    </>
  )

  return (
    <>
      <EncabezadoPagina
        titulo="Buscá tu vuelo"
        subtitulo="Vuelos directos a Argentina, América y Europa, con el precio final a la vista."
      />

      <div className="contenedor sobre-encabezado vuelos-pagina">
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

            {!cargando && resultado && idaYVuelta && (
              <>
                <p className="vuelos-ayuda">
                  Elegí un vuelo de ida y uno de vuelta y agregalos al carrito para comprarlos juntos.
                </p>

                <div className="vuelos-tramo">
                  <span className="vuelos-tramo-numero">1</span>
                  <div>
                    <h2>Vuelos de ida</h2>
                    <p className="texto-suave">
                      {resultado.ida.content[0]
                        ? `${resultado.ida.content[0].origenCiudad} → ${resultado.ida.content[0].destinoCiudad}`
                        : 'Sin vuelos para esta ruta'}{' '}
                      · {resultado.ida.totalElements} opciones
                    </p>
                  </div>
                </div>
                {listaDeVuelos(resultado.ida)}

                <div className="vuelos-tramo">
                  <span className="vuelos-tramo-numero">2</span>
                  <div>
                    <h2>Vuelos de vuelta</h2>
                    <p className="texto-suave">
                      {resultado.vuelta.content[0]
                        ? `${resultado.vuelta.content[0].origenCiudad} → ${resultado.vuelta.content[0].destinoCiudad}`
                        : 'Sin vuelos de regreso para esta ruta'}{' '}
                      · {resultado.vuelta.totalElements} opciones
                    </p>
                  </div>
                </div>
                {listaDeVuelos(resultado.vuelta)}
              </>
            )}

            {!cargando && resultado && !idaYVuelta && (
              <>
                <p className="vuelos-cantidad">
                  {resultado.ida.totalElements === 1
                    ? '1 vuelo encontrado'
                    : `${resultado.ida.totalElements} vuelos encontrados`}
                </p>

                {listaDeVuelos(resultado.ida)}

                {resultado.ida.totalPages > 1 && (
                  <nav className="vuelos-paginas" aria-label="Páginas de resultados">
                    <button
                      className="boton boton-secundario"
                      disabled={resultado.ida.first}
                      onClick={() => cambiarFiltro({ page: pagina - 1 })}
                    >
                      ← Anterior
                    </button>
                    <span>
                      Página {pagina + 1} de {resultado.ida.totalPages}
                    </span>
                    <button
                      className="boton boton-secundario"
                      disabled={resultado.ida.last}
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
    </>
  )
}

export default Vuelos
