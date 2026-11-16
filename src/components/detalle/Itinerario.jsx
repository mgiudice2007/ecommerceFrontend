import { duracion, fechaLarga, hora } from '../../utils/formato'
import './Itinerario.css'

function Itinerario({ vuelo }) {
  return (
    <section className="tarjeta">
      <h2 className="detalle-subtitulo">Itinerario</h2>
      <div className="detalle-itinerario">
        <div>
          <small>Salida · {fechaLarga(vuelo.fechaSalida)}</small>
          <strong>{hora(vuelo.fechaSalida)}</strong>
          <span>
            {vuelo.origenIata} · {vuelo.origenCiudad}
          </span>
        </div>
        <div className="detalle-duracion">
          <span>{duracion(vuelo.duracionMinutos)}</span>
          <small>Directo</small>
        </div>
        <div className="derecha">
          <small>Llegada · {fechaLarga(vuelo.fechaLlegada)}</small>
          <strong>{hora(vuelo.fechaLlegada)}</strong>
          <span>
            {vuelo.destinoIata} · {vuelo.destinoCiudad}
          </span>
        </div>
      </div>

      {vuelo.descripcion && <p className="detalle-descripcion">{vuelo.descripcion}</p>}
    </section>
  )
}

export default Itinerario
