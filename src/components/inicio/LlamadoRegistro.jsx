import { Link } from 'react-router-dom'
import './LlamadoRegistro.css'

function LlamadoRegistro() {
  return (
    <section className="contenedor inicio-seccion">
      <div className="inicio-cuenta">
        <div>
          <span className="inicio-cuenta-chip">Creá tu cuenta gratis</span>
          <h2>Viajá más fácil con tu cuenta BCA Airlines</h2>
          <p>
            Guardá tu carrito, comprá tus pasajes de ida y vuelta en minutos y revisá o cancelá tus compras cuando
            quieras.
          </p>
        </div>
        <Link to="/registro" className="boton inicio-cuenta-boton">
          Crear mi cuenta →
        </Link>
      </div>
    </section>
  )
}

export default LlamadoRegistro
