import './SelectorMedioPago.css'

function SelectorMedioPago({ medios, elegido, onElegir }) {
  return (
    <fieldset className="medios-pago">
      <legend>¿Cómo querés pagar?</legend>
      {medios.map((medio) => (
        <label key={medio.id} className={`medio-pago ${elegido === medio.id ? 'medio-pago-elegido' : ''}`}>
          <input
            type="radio"
            name="medioPago"
            value={medio.id}
            checked={elegido === medio.id}
            onChange={() => onElegir(medio.id)}
          />
          <span>
            <strong>{medio.nombre}</strong>
            <small>{medio.detalle}</small>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

export default SelectorMedioPago
