import './Cargando.css'

// Avioncito que da vueltas mientras se espera la respuesta del backend
const Avioncito = () => (
  <span className="cargando-orbita" aria-hidden="true">
    <span>✈</span>
  </span>
)

function Cargando({ texto = 'Cargando…', pagina = false, className = '' }) {
  if (pagina) {
    return (
      <div className="contenedor pagina texto-suave cargando">
        <Avioncito />
        {texto}
      </div>
    )
  }

  return (
    <p className={`texto-suave cargando ${className}`.trim()}>
      <Avioncito />
      {texto}
    </p>
  )
}

export default Cargando
