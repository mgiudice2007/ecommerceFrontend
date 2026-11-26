import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fechaLarga, hora } from '../../utils/formato'
import LetrasGiratorias from '../comunes/LetrasGiratorias'
import './CuentaRegresiva.css'

const dosDigitos = (n) => String(n).padStart(2, '0')

// Cuanto falta, separado en dias, horas, minutos y segundos
const partesQueFaltan = (milisegundos) => {
  const segundos = Math.max(0, Math.floor(milisegundos / 1000))
  return {
    dias: Math.floor(segundos / 86400),
    horas: Math.floor((segundos % 86400) / 3600),
    minutos: Math.floor((segundos % 3600) / 60),
    segundos: segundos % 60,
  }
}

// Cartel con la cuenta regresiva para el proximo vuelo. Cada numero gira como en el
// cartel de partidas cuando cambia (la key nueva hace que LetrasGiratorias arranque de cero).
function CuentaRegresiva({ proximo }) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const falta = partesQueFaltan(proximo.salida - ahora)
  const bloques = [
    { rotulo: 'Días', valor: String(falta.dias) },
    { rotulo: 'Horas', valor: dosDigitos(falta.horas) },
    { rotulo: 'Min', valor: dosDigitos(falta.minutos) },
    { rotulo: 'Seg', valor: dosDigitos(falta.segundos) },
  ]

  return (
    <section className="cuenta-regresiva">
      <div className="cuenta-regresiva-texto">
        <span>Tu próximo vuelo</span>
        <strong>{proximo.destino}</strong>
        <small>
          Vuelo {proximo.numeroVuelo} · {fechaLarga(proximo.salida)} · {hora(proximo.salida)} hs
        </small>
        <Link to={`/mis-compras/${proximo.ordenId}`}>Ver mi pase de embarque →</Link>
      </div>

      <div className="cuenta-regresiva-reloj" aria-label="Tiempo que falta para el vuelo">
        {bloques.map((b) => (
          <div key={b.rotulo} className="cuenta-regresiva-bloque">
            <LetrasGiratorias key={b.valor} texto={b.valor} />
            <small>{b.rotulo}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CuentaRegresiva
