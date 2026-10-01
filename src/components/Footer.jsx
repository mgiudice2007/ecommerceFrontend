import { Link } from 'react-router-dom'
import Logo from './Logo'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor footer-interior">
        <div className="footer-marca">
          <Logo claro />
          <p>Pasajes de avión a destinos de Argentina y el mundo, publicados por vendedores verificados.</p>
        </div>

        <div>
          <h4>Pasajeros</h4>
          <Link to="/vuelos">Buscar vuelos</Link>
          <Link to="/mis-compras">Mis compras</Link>
          <Link to="/perfil">Mi perfil</Link>
        </div>

        <div>
          <h4>Vendedores</h4>
          <Link to="/registro">Publicar vuelos</Link>
          <Link to="/panel">Panel de vuelos</Link>
        </div>
      </div>

      <div className="contenedor footer-legal">
        © 2026 BCA Airlines · Trabajo práctico — UADE
      </div>
    </footer>
  )
}

export default Footer
