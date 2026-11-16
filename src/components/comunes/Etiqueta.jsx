function Etiqueta({ tipo, className = '', children }) {
  const clases = ['etiqueta', tipo && `etiqueta-${tipo}`, className].filter(Boolean).join(' ')

  return <span className={clases}>{children}</span>
}

export default Etiqueta
