import { Link } from 'react-router-dom'

// Pagina provisoria para las secciones que todavia no estan hechas.
// Se va a ir reemplazando parte por parte.
function Proximamente({ titulo }) {
  return (
    <div className="contenedor pagina">
      <div className="tarjeta" style={{ textAlign: 'center', padding: 48 }}>
        <span className="etiqueta">En construcción</span>
        <h1 style={{ margin: '16px 0 8px' }}>{titulo}</h1>
        <p className="texto-suave">Esta sección se agrega en las próximas partes del frontend.</p>
        <Link to="/" className="boton boton-secundario">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default Proximamente
