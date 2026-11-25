import { useEffect, useState } from 'react'
import { api, pedirPortadas } from '../api/api'
import Buscador from '../components/Buscador'
import Cargando from '../components/comunes/Cargando'
import Mensaje from '../components/comunes/Mensaje'
import AtajosBusqueda from '../components/inicio/AtajosBusqueda'
import Beneficios from '../components/inicio/Beneficios'
import Hero from '../components/inicio/Hero'
import LlamadoRegistro from '../components/inicio/LlamadoRegistro'
import SeccionDestinos from '../components/inicio/SeccionDestinos'
import SeccionMundo from '../components/inicio/SeccionMundo'
import { useAuth } from '../context/AuthContext'
import { argentinaDe, ATAJOS, destinosMostrados, mundoDe, ofertasDe, REGIONES } from '../utils/destinos'
import { estaOperativo } from '../utils/vuelos'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAeropuertos } from '../redux/catalogoSlice'
import './Inicio.css'

function Inicio() {
  const { estaLogueado } = useAuth()
  const dispatch = useDispatch()
  const { aeropuertos } = useSelector((state) => state.catalogo)

  useEffect(() => {
    dispatch(fetchAeropuertos())
  }, [dispatch])

  const [vuelos, setVuelos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [region, setRegion] = useState(REGIONES[0].categoria)
  const [portadas, setPortadas] = useState({})

  useEffect(() => {
    api('/api/vuelos?page=0&size=60')
      .then((pagina) => {
        const operativos = pagina.content.filter((v) => estaOperativo(v) && v.hayStock)
        setVuelos(operativos)
        pedirPortadas(destinosMostrados(operativos).map((v) => v.id)).then((datos) => setPortadas(datos))
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const paisDe = (iata) => aeropuertos.find((a) => a.codigoIata === iata)?.pais

  const ofertas = ofertasDe(vuelos)
  const argentina = argentinaDe(vuelos)

  return (
    <>
      <Hero />

      <div className="contenedor inicio-buscador">
        <Buscador aeropuertos={aeropuertos} />
        <AtajosBusqueda atajos={ATAJOS} />
      </div>

      <Beneficios />

      {error && (
        <div className="contenedor">
          <Mensaje>{error}</Mensaje>
        </div>
      )}
      {cargando && <Cargando texto="Cargando vuelos…" className="contenedor" />}

      {ofertas.length > 0 && (
        <SeccionDestinos
          sobretitulo="Ofertas por tiempo limitado"
          titulo="Promociones imperdibles"
          vuelos={ofertas}
          paisDe={paisDe}
          portadas={portadas}
        />
      )}

      {argentina.length > 0 && (
        <SeccionDestinos
          sobretitulo="Viajá por el país"
          titulo="Destinos en Argentina"
          vuelos={argentina}
          paisDe={paisDe}
          portadas={portadas}
        />
      )}

      {vuelos.length > 0 && (
        <SeccionMundo
          regiones={REGIONES}
          region={region}
          onCambiarRegion={setRegion}
          vuelos={mundoDe(vuelos, region)}
          paisDe={paisDe}
          portadas={portadas}
        />
      )}

      {!estaLogueado && <LlamadoRegistro />}
    </>
  )
}

export default Inicio
