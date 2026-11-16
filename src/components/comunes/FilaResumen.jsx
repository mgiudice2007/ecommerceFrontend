import './FilaResumen.css'

function FilaResumen({ rotulo, valor, ahorro = false }) {
  return (
    <div className={`fila-resumen ${ahorro ? 'fila-resumen-ahorro' : ''}`.trim()}>
      <span>{rotulo}</span>
      <span>{valor}</span>
    </div>
  )
}

export default FilaResumen
