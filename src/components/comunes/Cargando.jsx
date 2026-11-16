function Cargando({ texto = 'Cargando…', pagina = false, className = '' }) {
  if (pagina) {
    return <div className="contenedor pagina texto-suave">{texto}</div>
  }

  return <p className={`texto-suave ${className}`.trim()}>{texto}</p>
}

export default Cargando
