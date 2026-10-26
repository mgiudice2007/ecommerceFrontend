import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/api'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import TarjetaVuelo from '../components/TarjetaVuelo'
import { sumarDias } from '../utils/formato'
import { leerPasajeros } from '../utils/pasajeros'
import './Vuelos.css'
import { sinRuedita } from '../utils/validaciones'

const POR_PAGINA = 10
const DIAS_FLEXIBLES = 3

const filtrarPorFecha = (params, fecha) => {
  params.set('fechaDesde', sumarDias(fecha, -DIAS_FLEXIBLES))
  params.set('fechaHasta', sumarDias(fecha, DIAS_FLEXIBLES))
}

const buscarVuelos = (params) => api(`/api/vuelos?${params.toString()}`)

function Vuelos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pagina = Number(searchParams.get('page') ?? 0)

  const busqueda = searchParams.toString()

  const [respuesta, setRespuesta] = useState({ busqueda: null, datos: null, error: '' })
  const cargando = respuesta.busqueda !== busqueda
  const resultado = cargando ? null : respuesta.datos
  const error = cargando ? '' : respuesta.error

  const [aeropuertos, setAeropuertos] = useState([])

  useEffect(() => {
    api('/api/aeropuertos')
      .then((data) => setAeropuertos(data))
      .catch(() => setAeropuertos([]))
  }, [])

  const [precios, setPrecios] = useState({
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
  })

  const faltaRuta = !searchParams.get('origen') || !searchParams.get('destino')

  const idaYVuelta =
    searchParams.get('viaje') === 'idavuelta' && searchParams.get('origen') && searchParams.get('destino')

  useEffect(() => {
    const params = new URLSearchParams(busqueda)
    if (!params.get('origen') || !params.get('destino')) return

    const esIdaYVuelta = params.get('viaje') === 'idavuelta' && params.get('origen') && params.get('destino')
    params.delete('viaje')
    params.delete('tramo')
    const fechaIda = params.get('ida')
    const fechaVuelta = params.get('vuelta')
    params.delete('ida')
    params.delete('vuelta')
    params.delete('adultos')
    params.delete('ninos')
    params.delete('bebes')

    if (!esIdaYVuelta) {
      if (fechaIda) filtrarPorFecha(params, fechaIda)
      params.set('page', params.get('page') ?? 0)
      params.set('size', POR_PAGINA)
      buscarVuelos(params)
        .then((ida) => setRespuesta({ busqueda, datos: { ida, vuelta: null }, error: '' }))
        .catch((err) => setRespuesta({ busqueda, datos: null, error: err.message }))
      return
    }

    params.delete('page')
    const vuelta = new URLSearchParams(params)
    vuelta.set('origen', params.get('destino'))
    vuelta.set('destino', params.get('origen'))
    if (fechaIda) filtrarPorFecha(params, fechaIda)
    if (fechaVuelta) {
      filtrarPorFecha(vuelta, fechaVuelta)
    } else if (fechaIda) {
      vuelta.set('fechaDesde', fechaIda)
    }

    buscarVuelos(params)
      .then((ida) =>
        buscarVuelos(vuelta).then((regreso) => setRespuesta({ busqueda, datos: { ida, vuelta: regreso }, error: '' })),
      )
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
    viaje: searchParams.get('viaje') ?? 'ida',
    ida: searchParams.get('ida') ?? '',
    vuelta: searchParams.get('vuelta') ?? '',
    pasajeros: leerPasajeros(searchParams),
  }

  const consultaPasajeros = searchParams.get('adultos')
    ? `?adultos=${searchParams.get('adultos')}&ninos=${searchParams.get('ninos') ?? 0}&bebes=${searchParams.get('bebes') ?? 0}`
    : ''

  const hayFecha = searchParams.get('ida') || searchParams.get('vuelta')

  const soloVuelta = idaYVuelta && searchParams.get('tramo') === 'vuelta'

  const consultaIda = (() => {
    const p = new URLSearchParams(consultaPasajeros)
    p.set('viaje', 'idavuelta')
    p.set('tramo', 'ida')
    p.set('origen', searchParams.get('origen') ?? '')
    p.set('destino', searchParams.get('destino') ?? '')
    if (searchParams.get('ida')) p.set('ida', searchParams.get('ida'))
    if (searchParams.get('vuelta')) p.set('vuelta', searchParams.get('vuelta'))
    return `?${p.toString()}`
  })()

  const listaDeVuelos = (pagina, consulta = consultaPasajeros) => (
    <>
      {pagina.content.length === 0 && (
        <div className="tarjeta vuelos-vacio">
          <h3>{pagina.mensaje ?? 'No encontramos vuelos con esos filtros'}</h3>
          <p className="texto-suave">Probá con otro destino o sacá algún filtro.</p>
        </div>
      )}
      <div className="vuelos-lista">
        {pagina.content.map((vuelo) => (
          <TarjetaVuelo key={vuelo.id} vuelo={vuelo} pasajeros={consulta} />
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
        <Buscador key={searchParams.toString()} inicial={filtrosIniciales} aeropuertos={aeropuertos} />

        {faltaRuta && (
          <div className="tarjeta vuelos-vacio">
            <h3>¿A dónde querés viajar?</h3>
            <p className="texto-suave">Elegí el origen y el destino en el buscador para ver los vuelos disponibles.</p>
          </div>
        )}

        {!faltaRuta && (
          <div className="vuelos-layout">
            <aside className="tarjeta vuelos-filtros">
              <h2>Filtrar por precio</h2>
              <form onSubmit={aplicarPrecios}>
                <div className="campo">
                  <label htmlFor="precioMin">Precio mínimo</label>
                  <input
                    id="precioMin"
                    type="number"
                    onWheel={sinRuedita}
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
                    onWheel={sinRuedita}
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

              {hayFecha && (
                <p className="vuelos-ayuda">
                  📅 Fechas flexibles: te mostramos los vuelos que salen hasta {DIAS_FLEXIBLES} días antes o después de
                  la fecha que elegiste.
                </p>
              )}

              {!cargando && resultado && idaYVuelta && (
                <>
                  {soloVuelta ? (
                    <div className="mensaje mensaje-exito">
                      ✓ Tu vuelo de ida ya está en el carrito. Ahora elegí el vuelo de vuelta.{' '}
                      <Link to="/carrito">Ir al carrito</Link>
                    </div>
                  ) : (
                    <>
                      <p className="vuelos-ayuda">
                        Elegí un vuelo de ida, agregalo al carrito y seguí con el de vuelta.
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
                      {listaDeVuelos(resultado.ida, consultaIda)}
                    </>
                  )}

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
        )}
      </div>
    </>
  )
}

export default Vuelos
