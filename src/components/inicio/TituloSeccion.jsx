import './SeccionDestinos.css'

function TituloSeccion({ sobretitulo, titulo, children }) {
  return (
    <div className="inicio-titulo">
      <div>
        <span className="inicio-sobretitulo">{sobretitulo}</span>
        <h2>{titulo}</h2>
      </div>
      {children}
    </div>
  )
}

export default TituloSeccion
