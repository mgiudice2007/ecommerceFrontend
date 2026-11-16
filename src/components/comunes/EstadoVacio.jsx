import './EstadoVacio.css'

function EstadoVacio({ titulo, texto, nivel = 2, className = '', children }) {
  const Titulo = `h${nivel}`

  return (
    <div className={`tarjeta estado-vacio ${className}`.trim()}>
      <Titulo>{titulo}</Titulo>
      {texto && <p className="texto-suave">{texto}</p>}
      {children}
    </div>
  )
}

export default EstadoVacio
