import { Link } from 'react-router-dom'
import './EncabezadoOrden.css'

function EncabezadoOrden({ orden }) {
  return (
    <header className="orden-encabezado">
      <Link to="/mis-compras">← Mis compras</Link>
      <h1>Compra #{orden.id}</h1>
    </header>
  )
}

export default EncabezadoOrden
