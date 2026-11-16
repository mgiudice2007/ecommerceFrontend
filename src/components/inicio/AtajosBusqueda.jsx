import { Link } from 'react-router-dom'
import './AtajosBusqueda.css'

function AtajosBusqueda({ atajos }) {
  return (
    <div className="inicio-atajos">
      <span>Búsquedas frecuentes:</span>
      {atajos.map((a) => (
        <Link key={a.destino} to={`/vuelos?origen=${a.origen}&destino=${a.destino}`}>
          {a.texto}
        </Link>
      ))}
    </div>
  )
}

export default AtajosBusqueda
