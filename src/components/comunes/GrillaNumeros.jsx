import TarjetaNumero from './TarjetaNumero'
import './TarjetaNumero.css'

function GrillaNumeros({ numeros, columnas = 3 }) {
  return (
    <div className="grilla-numeros" style={{ '--columnas': columnas }}>
      {numeros.map((n) => (
        <TarjetaNumero key={n.rotulo} rotulo={n.rotulo} valor={n.valor} />
      ))}
    </div>
  )
}

export default GrillaNumeros
