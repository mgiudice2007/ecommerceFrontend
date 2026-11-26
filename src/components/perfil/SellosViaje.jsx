import { fechaCorta } from '../../utils/formato'
import './SellosViaje.css'

// Formas y colores de los sellos: van rotando para que cada uno se vea distinto
const FORMAS = ['redondo', 'rectangular', 'ovalado']
const COLORES = ['naranja', 'azul', 'verde', 'bordo', 'violeta']
// Giro de cada sello entre -14 y 14 grados, fijo para cada posicion
const giroDe = (i) => ((i * 37) % 29) - 14

// Pagina del pasaporte con un sello por cada destino de las compras confirmadas
function SellosViaje({ sellos }) {
  return (
    <section className="tarjeta sellos-viaje">
      <div className="sellos-viaje-encabezado">
        <span>Visas · Sellos de viaje</span>
        <small>
          {sellos.length === 0
            ? 'Todavía no tenés sellos'
            : `${sellos.length} ${sellos.length === 1 ? 'destino' : 'destinos'}`}
        </small>
      </div>

      {sellos.length === 0 ? (
        <p className="sellos-viaje-vacio">Tu primer sello te espera ✈</p>
      ) : (
        <div className="sellos-viaje-hoja">
          {sellos.map((sello, i) => (
            <div
              key={sello.clave}
              className={`sello-viaje ${FORMAS[i % FORMAS.length]} ${COLORES[i % COLORES.length]}`}
              style={{ '--giro': `${giroDe(i)}deg`, animationDelay: `${0.15 + i * 0.12}s` }}
            >
              <small>BCA Airlines</small>
              <strong>{sello.iata}</strong>
              <span>{sello.ciudad}</span>
              <small>{fechaCorta(sello.fecha)}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default SellosViaje
