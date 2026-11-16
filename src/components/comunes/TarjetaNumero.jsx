import './TarjetaNumero.css'

function TarjetaNumero({ rotulo, valor }) {
  return (
    <div className="tarjeta tarjeta-numero">
      <small>{rotulo}</small>
      <strong>{valor}</strong>
    </div>
  )
}

export default TarjetaNumero
