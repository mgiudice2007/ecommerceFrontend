import './PasosCompra.css'

const PASOS = ['Carrito', 'Pasajeros', 'Pago', 'Listo']

function PasosCompra({ actual }) {
  return (
    <ol className="pasos-compra" aria-label="Pasos de la compra">
      {PASOS.map((paso, i) => (
        <li
          key={paso}
          className={i < actual ? 'paso-hecho' : i === actual ? 'paso-actual' : ''}
          aria-current={i === actual ? 'step' : undefined}
        >
          <span>{i < actual ? '✓' : i + 1}</span>
          {paso}
        </li>
      ))}
    </ol>
  )
}

export default PasosCompra
