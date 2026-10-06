import { Link } from 'react-router-dom'
import Logo from './Logo'
import './Footer.css'

// Cada link de destino lleva a la busqueda ya filtrada por ese aeropuerto
const DESTINOS_POPULARES = [
  { iata: 'BRC', ciudad: 'Bariloche' },
  { iata: 'IGR', ciudad: 'Puerto Iguazú' },
  { iata: 'MDZ', ciudad: 'Mendoza' },
  { iata: 'MIA', ciudad: 'Miami' },
  { iata: 'MAD', ciudad: 'Madrid' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor footer-interior">
        <div className="footer-marca">
          <Logo claro />
          <p>Pasajes de avión a destinos de Argentina, América y Europa. Elegí tu clase y comprá con el precio final.</p>
        </div>

        <div>
          <h4>Destinos populares</h4>
          {DESTINOS_POPULARES.map((d) => (
            <Link key={d.iata} to={`/vuelos?destino=${d.iata}`}>
              {d.ciudad}
            </Link>
          ))}
        </div>

        <div>
          <h4>Pasajeros</h4>
          <Link to="/vuelos">Buscar vuelos</Link>
          <Link to="/mis-compras">Mis compras</Link>
          <Link to="/carrito">Mi carrito</Link>
          <Link to="/perfil">Mi perfil</Link>
        </div>
      </div>

      <div className="contenedor footer-legal">
        <span>© 2026 BCA Airlines · Todos los derechos reservados</span>
        <span>Precios finales por pasajero en pesos argentinos, sujetos a disponibilidad.</span>
      </div>
    </footer>
  )
}

export default Footer
