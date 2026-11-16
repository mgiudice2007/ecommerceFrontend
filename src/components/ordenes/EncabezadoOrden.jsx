import { Link } from 'react-router-dom'
import Etiqueta from '../comunes/Etiqueta'
import './EncabezadoOrden.css'

function EncabezadoOrden({ orden, recienComprada }) {
  if (recienComprada) {
    return (
      <header className="orden-exito">
        <span className="orden-exito-icono" aria-hidden="true">
          ✓
        </span>
        <Etiqueta tipo="exito">Compra aprobada</Etiqueta>
        <h1>¡Compra confirmada!</h1>
        <p className="texto-suave">
          Tus asientos quedaron reservados. Podés ver esta compra cuando quieras en Mis compras.
        </p>
      </header>
    )
  }

  return (
    <header className="orden-encabezado">
      <Link to="/mis-compras">← Mis compras</Link>
      <h1>Compra #{orden.id}</h1>
    </header>
  )
}

export default EncabezadoOrden
