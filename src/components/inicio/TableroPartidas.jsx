import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hora, precio } from '../../utils/formato'
import { precioDesde } from '../../utils/vuelos'
import LetrasGiratorias from './LetrasGiratorias'
import TituloSeccion from './TituloSeccion'
import './TableroPartidas.css'

const FILAS = 5
const SEGUNDOS_POR_PAGINA = 8

// Puerta de embarque de adorno, pero fija para cada vuelo (sale del id)
const puertaDe = (vuelo) => `${'ABC'[vuelo.id % 3]}${(vuelo.id % 12) + 1}`

const relojAhora = () => hora(new Date())

// Cartel de partidas como el de Ezeiza: muestra los proximos vuelos de a 5 y cada
// 8 segundos pasa a los siguientes, con las letras girando.
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
          <span className="tablero-titulo">
            <span aria-hidden="true">🛫</span> Partidas · Departures
          </span>
          <span className="tablero-reloj">{reloj}</span>
        </div>

        <div className="tablero-fila tablero-columnas" aria-hidden="true">
          <span>Hora</span>
          <span>Vuelo</span>
          <span>Destino</span>
          <span className="tablero-opcional">Puerta</span>
          <span>Desde</span>
          <span className="tablero-opcional">Estado</span>
        </div>

        {visibles.map((vuelo, i) => {
          const oferta = Boolean(vuelo.descuentoVigente)
          return (
            <Link key={`${pagina}-${vuelo.id}`} to={`/vuelos/${vuelo.id}`} className="tablero-fila">
              <LetrasGiratorias texto={hora(vuelo.fechaSalida)} demora={i * 2} />
              <LetrasGiratorias texto={vuelo.numeroVuelo} largo={6} demora={i * 2 + 2} />
              <LetrasGiratorias texto={vuelo.destinoCiudad} largo={14} demora={i * 2 + 4} />
              <span className="tablero-opcional">
                <LetrasGiratorias texto={puertaDe(vuelo)} largo={3} demora={i * 2 + 6} />
              </span>
              <span className="tablero-precio">{precio(precioDesde(vuelo).precioConDescuento)}</span>
              <span className={`tablero-estado tablero-opcional ${oferta ? 'oferta' : ''}`}>
                {oferta ? 'Oferta' : 'A horario'}
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
