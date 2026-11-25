function Campo({ id, etiqueta, ayuda, error, className = '', children }) {
  return (
    <div className={`campo ${error ? 'campo-con-error' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {error ? (
        <small className="campo-error" id={`${id}-error`} role="alert">
          {error}
        </small>
      ) : (
        ayuda && <small className="texto-suave">{ayuda}</small>
      )}
    </div>
  )
}

export default Campo
