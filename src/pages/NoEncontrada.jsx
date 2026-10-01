import { Link } from 'react-router-dom'

function NoEncontrada() {
  return (
    <div className="contenedor pagina">
      <div className="tarjeta" style={{ textAlign: 'center', padding: 48 }}>
        <span className="etiqueta">Error 404</span>
        <h1 style={{ margin: '16px 0 8px' }}>Esta página no existe</h1>
        <p className="texto-suave">Puede que el link esté mal escrito o que la página se haya movido.</p>
        <Link to="/" className="boton boton-primario">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NoEncontrada
