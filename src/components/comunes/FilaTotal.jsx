import './FilaResumen.css'

function FilaTotal({ rotulo, valor, className = '' }) {
  return (
    <div className={`fila-total ${className}`.trim()}>
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  )
}

export default FilaTotal
