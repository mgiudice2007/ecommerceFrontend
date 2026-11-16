function Campo({ id, etiqueta, ayuda, className = '', children }) {
  return (
    <div className={`campo ${className}`.trim()}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && <small className="texto-suave">{ayuda}</small>}
    </div>
  )
}

export default Campo
