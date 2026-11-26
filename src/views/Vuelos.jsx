import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import Buscador from '../components/Buscador'
import EncabezadoPagina from '../components/EncabezadoPagina'
import Cargando from '../components/comunes/Cargando'
import EstadoVacio from '../components/comunes/EstadoVacio'
import Mensaje from '../components/comunes/Mensaje'
import AyudaVuelos from '../components/vuelos/AyudaVuelos'
import FiltroPrecio from '../components/vuelos/FiltroPrecio'
import ResultadosIdaYVuelta from '../components/vuelos/ResultadosIdaYVuelta'
import ResultadosSoloIda from '../components/vuelos/ResultadosSoloIda'
import { fetchBusqueda } from '../redux/vuelosSlice'
import {
  consultaDePasajeros,
  consultaDeTramoIda,
  consultasDeBusqueda,
  DIAS_FLEXIBLES,
  esIdaYVuelta,
} from '../utils/busqueda'
import { leerPasajeros } from '../utils/pasajeros'
import './Vuelos.css'

function Vuelos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pagina = Number(searchParams.get('page') ?? 0)

  const busqueda = searchParams.toString()

  const dispatch = useDispatch()
  const { aeropuertos } = useSelector((state) => state.catalogo)
  const { resultadoBusqueda, loading, error: errorBusqueda } = useSelector((state) => state.vuelos)

  // El resultado guardado en el store es de la búsqueda que se hizo antes; hasta que llegue el de esta, se espera
  const esDeEstaBusqueda = resultadoBusqueda?.consulta === busqueda
  const cargando = loading || (!esDeEstaBusqueda && !errorBusqueda)
  const resultado = !cargando && esDeEstaBusqueda ? resultadoBusqueda : null
  const error = cargando ? '' : errorBusqueda

  const [precios, setPrecios] = useState({
    precioMin: searchParams.get('precioMin') ?? '',
    precioMax: searchParams.get('precioMax') ?? '',
  })

  useEffect(() => {
    if (consultasDeBusqueda(busqueda)) {
      dispatch(fetchBusqueda(busqueda))
    }
  }, [busqueda, dispatch])

  const cambiarFiltro = (cambios) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor === '' || valor === null) params.delete(clave)
      else params.set(clave, valor)
    })
    setSearchParams(params)
  }

  const aplicarPrecios = () => cambiarFiltro({ ...precios, page: null })

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

  const faltaRuta = !searchParams.get('origen') || !searchParams.get('destino')
  const idaYVuelta = esIdaYVuelta(searchParams)
  const hayFecha = searchParams.get('ida') || searchParams.get('vuelta')
  const consultaPasajeros = consultaDePasajeros(searchParams)

  return (
    <>
      <EncabezadoPagina
        titulo="Buscá tu vuelo"
        subtitulo="Vuelos directos a Argentina, América y Europa, con el precio final a la vista."
      />

      <div className="contenedor sobre-encabezado vuelos-pagina">
        <Buscador key={searchParams.toString()} inicial={filtrosIniciales} aeropuertos={aeropuertos} />

        {faltaRuta && (
          <EstadoVacio
            nivel={3}
            titulo="¿A dónde querés viajar?"
            texto="Elegí el origen y el destino en el buscador para ver los vuelos disponibles."
          />
        )}

        {!faltaRuta && (
          <div className="vuelos-layout">
            <FiltroPrecio
              precios={precios}
              onCambiar={setPrecios}
              onAplicar={aplicarPrecios}
              onLimpiar={limpiarPrecios}
            />

            <section>
              {error && <Mensaje>{error}</Mensaje>}

              {cargando && <Cargando texto="Buscando vuelos…" />}

              {hayFecha && (
                <AyudaVuelos>
                  📅 Fechas flexibles: te mostramos los vuelos que salen hasta {DIAS_FLEXIBLES} días antes o después
                  de la fecha que elegiste.
                </AyudaVuelos>
              )}

              {!cargando && resultado && idaYVuelta && (
                <ResultadosIdaYVuelta
                  resultado={resultado}
                  soloVuelta={searchParams.get('tramo') === 'vuelta'}
                  consultaIda={consultaDeTramoIda(searchParams)}
                  consultaPasajeros={consultaPasajeros}
                />
              )}

              {!cargando && resultado && !idaYVuelta && (
                <ResultadosSoloIda
                  pagina={resultado.ida}
                  numeroPagina={pagina}
                  consulta={consultaPasajeros}
                  onCambiarPagina={(nueva) => cambiarFiltro({ page: nueva })}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </>
  )
}

export default Vuelos
