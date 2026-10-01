import { Link } from 'react-router-dom'
import './Logo.css'

// claro: version blanca para fondos oscuros (footer, paneles azules)
function Logo({ claro = false }) {
  return (
    <Link to="/" className={`logo ${claro ? 'logo-claro' : ''}`}>
      <span className="logo-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M21 11.4c0-.8-.6-1.4-1.4-1.4h-4.2L11.2 3.5H9.4l2 6.5H7.2L5.8 8.1H4.3l.9 3.3-.9 3.3h1.5l1.4-1.9h4.2l-2 6.6h1.8l4.2-6.6h4.2c.8 0 1.4-.6 1.4-1.4z"
          />
        </svg>
      </span>
      <span className="logo-texto">
        <strong>BCA Airlines</strong>
        <small>República Argentina</small>
      </span>
    </Link>
  )
}

export default Logo
