import './Paginador.css'

function Paginador({ pagina, totalPaginas, onCambiar, etiqueta = 'Páginas de resultados' }) {
  if (totalPaginas <= 1) return null

  return (
    <nav className="paginador" aria-label={etiqueta}>
      <button className="boton boton-secundario" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </button>
      <span>
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button
        className="boton boton-secundario"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </nav>
  )
}

export default Paginador
