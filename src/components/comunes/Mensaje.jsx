function Mensaje({ tipo = 'error', className = '', children }) {
  const clases = ['mensaje', tipo && `mensaje-${tipo}`, className].filter(Boolean).join(' ')

  return <div className={clases}>{children}</div>
}

export default Mensaje
