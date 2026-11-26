import { duracion, fechaLarga, hora } from '../../utils/formato'
import LetrasGiratorias from '../comunes/LetrasGiratorias'
import './Itinerario.css'

// Itinerario como mapa de vuelo: codigos grandes de cartel de aeropuerto y un
// avioncito que recorre la ruta entre los dos aeropuertos.
function Itinerario({ vuelo }) {
  return (
    <section className="tarjeta itinerario">
      <div className="itinerario-cabecera">
        <h2 className="detalle-subtitulo">Itinerario</h2>
        <span className="itinerario-vuelo">Vuelo {vuelo.numeroVuelo}</span>
      </div>

      <div className="detalle-itinerario">
        <div>
          <LetrasGiratorias texto={vuelo.origenIata} />
          <span className="itinerario-ciudad">{vuelo.origenCiudad}</span>
          <strong>{hora(vuelo.fechaSalida)}</strong>
          <small>Salida · {fechaLarga(vuelo.fechaSalida)}</small>
        </div>

        <div className="itinerario-ruta" aria-hidden="true">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <path d="M4 52 Q 100 -10 196 52" />
          </svg>
          <span className="itinerario-avion">✈</span>
        </div>

        <div className="derecha">
          <LetrasGiratorias texto={vuelo.destinoIata} demora={4} />
          <span className="itinerario-ciudad">{vuelo.destinoCiudad}</span>
          <strong>{hora(vuelo.fechaLlegada)}</strong>
          <small>Llegada · {fechaLarga(vuelo.fechaLlegada)}</small>
        </div>
      </div>

      <div className="itinerario-datos">
        <span>⏱ {duracion(vuelo.duracionMinutos)}</span>
        <span>✈ Directo</span>
        <span>🧳 {vuelo.categoriaNombre}</span>
      </div>

      {vuelo.descripcion && <p className="detalle-descripcion">{vuelo.descripcion}</p>}
    </section>
  )
}

export default Itinerario
