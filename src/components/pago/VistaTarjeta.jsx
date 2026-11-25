import './VistaTarjeta.css'

function VistaTarjeta({ numero, titular, vencimiento, tipo }) {
  return (
    <div className="vista-tarjeta" aria-hidden="true">
      <span className="vista-tarjeta-tipo">{tipo}</span>
      <strong className="vista-tarjeta-numero">{numero || '•••• •••• •••• ••••'}</strong>
      <div className="vista-tarjeta-pie">
        <span>
          <small>Titular</small>
          {titular.trim() || 'NOMBRE APELLIDO'}
        </span>
        <span>
          <small>Vence</small>
          {vencimiento || 'MM/AA'}
        </span>
      </div>
    </div>
  )
}

export default VistaTarjeta
