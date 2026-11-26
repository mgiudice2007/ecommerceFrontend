import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fechaLarga, hora } from '../../utils/formato'
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

// Cartel con la cuenta regresiva para el proximo vuelo. Cuando un numero cambia, entra
// deslizandose suave desde abajo (la key nueva hace que React lo monte de nuevo y la
// animacion CSS arranque otra vez).
function CuentaRegresiva({ proximo }) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const falta = partesQueFaltan(proximo.salida - ahora)
  const bloques = [
    { rotulo: falta.dias === 1 ? 'día' : 'días', valor: String(falta.dias) },
    { rotulo: 'horas', valor: dosDigitos(falta.horas) },
    { rotulo: 'min', valor: dosDigitos(falta.minutos) },
    { rotulo: 'seg', valor: dosDigitos(falta.segundos) },
  ]

  return (
    <section className="cuenta-regresiva">
      <div className="cuenta-regresiva-texto">
        <span>✈ Tu próximo vuelo</span>
        <strong>{proximo.destino}</strong>
        <small>
          Vuelo {proximo.numeroVuelo} · {fechaLarga(proximo.salida)} · {hora(proximo.salida)} hs
        </small>
        <Link to={`/mis-compras/${proximo.ordenId}`}>Ver mi pase de embarque →</Link>
      </div>

      <div className="cuenta-regresiva-reloj" aria-label="Tiempo que falta para el vuelo">
        {bloques.map((b, i) => (
          <div key={b.rotulo} className="cuenta-regresiva-bloque">
            {i > 0 && (
              <span className="cuenta-regresiva-separador" aria-hidden="true">
                :
              </span>
            )}
            <div>
              <strong key={b.valor} className="cuenta-regresiva-numero">
                {b.valor}
              </strong>
              <small>{b.rotulo}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CuentaRegresiva
