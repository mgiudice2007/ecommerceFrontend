import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  buscarAeropuerto,
  destinosDe,
  etiquetaAeropuerto,
  origenesDe,
  partesDeFecha,
  problemaEnBusqueda,
  sugerenciasDe,
  urlDeBusqueda,
} from '../utils/buscador'
import { hoy } from '../utils/formato'
import { SIN_PASAJEROS_EXTRA } from '../utils/pasajeros'
import CampoAeropuerto from './buscador/CampoAeropuerto'
import CampoPasajeros from './buscador/CampoPasajeros'
import SelectorTipoViaje from './buscador/SelectorTipoViaje'
import CampoFecha from './CampoFecha'
import './Buscador.css'

// Fecha estilo pasaje: el dia grande y al lado el mes y el dia de la semana
function FechaPase({ fecha }) {
  const partes = partesDeFecha(fecha)
  if (!partes) return null
  return (
    <span className="buscador-fecha-pase" aria-hidden="true">
      <strong>{partes.dia}</strong>
      <small>{partes.detalle}</small>
    </span>
  )
}

function Buscador({ inicial = {}, aeropuertos = [] }) {
  const navigate = useNavigate()

  const [viaje, setViaje] = useState(inicial.viaje ?? 'idavuelta')
  const [pasajeros, setPasajeros] = useState(inicial.pasajeros ?? SIN_PASAJEROS_EXTRA)
  const [verPasajeros, setVerPasajeros] = useState(false)
  const [error, setError] = useState('')
  const [despegando, setDespegando] = useState(false)
  const [filtros, setFiltros] = useState({
    origen: inicial.origen ?? '',
    destino: inicial.destino ?? '',
    ida: inicial.ida ?? '',
    vuelta: inicial.vuelta ?? '',
  })

  const [textos, setTextos] = useState({ origen: null, destino: null })
  const [abierto, setAbierto] = useState(null)

  const origenes = origenesDe(aeropuertos)
  const destinos = destinosDe(aeropuertos, filtros.origen)
  const listas = { origen: origenes, destino: destinos }

  const textoDe = (campo) => {
    if (textos[campo] !== null) return textos[campo]
    const aeropuerto = listas[campo].find((a) => a.codigoIata === filtros[campo])
    return aeropuerto ? etiquetaAeropuerto(aeropuerto) : ''
  }

  const elegir = (campo, aeropuerto) => {
    const cambiaOrigen = campo === 'origen' && filtros.origen !== aeropuerto.codigoIata
    const nuevos = { ...filtros, [campo]: aeropuerto.codigoIata }
    if (cambiaOrigen) nuevos.destino = ''
    setFiltros(nuevos)
    setTextos(
      cambiaOrigen
        ? { origen: etiquetaAeropuerto(aeropuerto), destino: '' }
        : { ...textos, [campo]: etiquetaAeropuerto(aeropuerto) },
    )
    setAbierto(null)
    setError('')
  }

  const escribir = (campo, texto) => {
    const aeropuerto = buscarAeropuerto(listas[campo], texto)
    const nuevos = { ...filtros, [campo]: aeropuerto ? aeropuerto.codigoIata : '' }
    if (campo === 'origen') nuevos.destino = ''
    setFiltros(nuevos)
    setTextos(campo === 'origen' ? { origen: texto, destino: '' } : { ...textos, destino: texto })
    setError('')
  }

  const cambiarFecha = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor })
    setError('')
  }

  const cambiarViaje = (nuevo) => {
    setViaje(nuevo)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const problema = problemaEnBusqueda({
      viaje,
      filtros,
      textoOrigen: textoDe('origen'),
      textoDestino: textoDe('destino'),
    })
    if (problema) {
      setError(problema)
      return
    }
    // El avion del boton despega y recien despues se va a los resultados
    setDespegando(true)
    setTimeout(() => navigate(urlDeBusqueda(viaje, filtros, pasajeros)), 450)
  }

  return (
    <form className="buscador tarjeta" onSubmit={handleSubmit}>
      <div className="buscador-cabecera">
        <h2>¿A dónde querés ir?</h2>
        <SelectorTipoViaje viaje={viaje} onCambiar={cambiarViaje} />
      </div>

      <div className="buscador-ruta">
        <CampoAeropuerto
          id="origen"
          etiqueta="Desde"
          codigo={filtros.origen}
          placeholder="Aeroparque o Ezeiza"
          valor={textoDe('origen')}
          sugerencias={sugerenciasDe(origenes, textoDe('origen'), filtros.origen)}
          detalleDe={(a) => (a.codigoIata === 'AEP' ? 'Vuelos de cabotaje' : 'Vuelos internacionales')}
          textoSinSugerencias="Los vuelos salen de Aeroparque o Ezeiza"
          abierto={abierto === 'origen'}
          onAbrir={() => setAbierto('origen')}
          onCerrar={() => setAbierto(null)}
          onEscribir={(texto) => escribir('origen', texto)}
          onElegir={(a) => elegir('origen', a)}
        />

        {/* Ruta punteada entre los dos aeropuertos: un avion si es solo ida, ida y vuelta si no */}
        <div className="buscador-trayecto" aria-hidden="true">
          <span className={`buscador-trayecto-icono ${viaje === 'idavuelta' ? 'ida-vuelta' : ''}`}>
            {viaje === 'idavuelta' ? '⇄' : '✈'}
          </span>
        </div>

        <CampoAeropuerto
          id="destino"
          etiqueta="Hacia"
          codigo={filtros.destino}
          placeholder="Escribí un destino"
          valor={textoDe('destino')}
          sugerencias={sugerenciasDe(destinos, textoDe('destino'), filtros.destino)}
          detalleDe={(a) => a.pais}
          textoSinSugerencias="No hay destinos que empiecen así"
          abierto={abierto === 'destino'}
          onAbrir={() => setAbierto('destino')}
          onCerrar={() => setAbierto(null)}
          onEscribir={(texto) => escribir('destino', texto)}
          onElegir={(a) => elegir('destino', a)}
        />
      </div>

      <div className="buscador-fila">
        <div className="buscador-campo">
          <label htmlFor="ida">Ida</label>
          <FechaPase fecha={filtros.ida} />
          <CampoFecha id="ida" min={hoy()} value={filtros.ida} onChange={(valor) => cambiarFecha('ida', valor)} />
        </div>

        {viaje === 'idavuelta' && (
          <div className="buscador-campo">
            <label htmlFor="vuelta">Vuelta</label>
            <FechaPase fecha={filtros.vuelta} />
            <CampoFecha
              id="vuelta"
              min={filtros.ida || hoy()}
              value={filtros.vuelta}
              onChange={(valor) => cambiarFecha('vuelta', valor)}
            />
          </div>
        )}

        <CampoPasajeros
          pasajeros={pasajeros}
          abierto={verPasajeros}
          onAlternar={() => setVerPasajeros(!verPasajeros)}
          onCambiar={setPasajeros}
        />

        <button className={`boton boton-accion buscador-boton ${despegando ? 'despegando' : ''}`}>
          Buscar vuelos
          <span className="buscador-boton-avion" aria-hidden="true">
            ✈
          </span>
        </button>
      </div>

      {error && <p className="buscador-error">{error}</p>}
    </form>
  )
}

export default Buscador
