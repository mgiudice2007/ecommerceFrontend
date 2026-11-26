import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fechaCorta, hora, precio } from '../../utils/formato'
import { precioDesde } from '../../utils/vuelos'
import LetrasGiratorias from '../comunes/LetrasGiratorias'
import TituloSeccion from './TituloSeccion'
import './TableroPartidas.css'

const FILAS = 5
const SEGUNDOS_POR_PAGINA = 8

// Puerta de embarque de adorno, pero fija para cada vuelo (sale del id)
const puertaDe = (vuelo) => `${'ABC'[vuelo.id % 3]}${(vuelo.id % 12) + 1}`

const relojAhora = () => hora(new Date())

// Cartel de partidas como el de los aeropuertos: muestra los proximos vuelos de a 5 y
// cada 8 segundos pasa a los siguientes. La hora y el destino giran letra por letra.
function TableroPartidas({ vuelos }) {
  const partidas = [...vuelos].sort((a, b) => a.fechaSalida.localeCompare(b.fechaSalida)).slice(0, FILAS * 3)
  const paginas = Math.max(1, Math.ceil(partidas.length / FILAS))

  const [pagina, setPagina] = useState(0)
  const [reloj, setReloj] = useState(relojAhora)

  useEffect(() => {
    const id = setInterval(() => {
      setPagina((p) => (p + 1) % paginas)
      setReloj(relojAhora())
    }, SEGUNDOS_POR_PAGINA * 1000)
    return () => clearInterval(id)
  }, [paginas])

  const visibles = partidas.slice(pagina * FILAS, pagina * FILAS + FILAS)

  return (
    <section className="contenedor inicio-seccion">
      <TituloSeccion sobretitulo="En vivo desde el aeropuerto" titulo="Próximas partidas" />

      <div className="tablero">
        <div className="tablero-cabecera">
          <div className="tablero-titulo">
            <span className="tablero-icono" aria-hidden="true">
              ✈
            </span>
            <div>
              <strong>Partidas</strong>
              <small>Departures</small>
            </div>
          </div>
          <div className="tablero-vivo">
            <span className="tablero-punto" aria-hidden="true" />
            En vivo
            <span className="tablero-reloj">{reloj}</span>
          </div>
        </div>

        <div className="tablero-fila tablero-columnas" aria-hidden="true">
          <span>Hora</span>
          <span>Destino</span>
          <span className="tablero-opcional">Puerta</span>
          <span className="tablero-opcional">Estado</span>
          <span className="derecha">Desde</span>
        </div>

        {visibles.map((vuelo, i) => {
          const oferta = Boolean(vuelo.descuentoVigente)
          return (
            <Link key={`${pagina}-${vuelo.id}`} to={`/vuelos/${vuelo.id}`} className="tablero-fila">
              <span className="tablero-hora">
                <LetrasGiratorias texto={hora(vuelo.fechaSalida)} demora={i * 2} paletas={false} />
                <small>{fechaCorta(vuelo.fechaSalida)}</small>
              </span>

              <span className="tablero-destino">
                <LetrasGiratorias texto={vuelo.destinoCiudad} demora={i * 2 + 3} paletas={false} />
                <small>
                  {vuelo.numeroVuelo} · desde {vuelo.origenCiudad}
                </small>
              </span>

              <span className="tablero-opcional">
                <span className="tablero-puerta">{puertaDe(vuelo)}</span>
              </span>

              <span className="tablero-opcional">
                <span className={`tablero-estado ${oferta ? 'oferta' : ''}`}>{oferta ? 'Oferta' : 'A horario'}</span>
              </span>

              <span className="tablero-precio">
                {precio(precioDesde(vuelo).precioConDescuento)}
                <span className="tablero-flecha" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          )
        })}

        <div className="tablero-puntos" aria-hidden="true">
          {Array.from({ length: paginas }, (_, i) => (
            <span key={i} className={i === pagina ? 'activo' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TableroPartidas
