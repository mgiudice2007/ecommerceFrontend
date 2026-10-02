import './EncabezadoPagina.css'

// Franja azul de arriba que comparten las paginas (busqueda, carrito, compras, perfil).
// children: lo que va debajo del titulo (por ejemplo, un link para volver)
function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <section className="encabezado-pagina">
      <div className="contenedor">
        {children}
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
    </section>
  )
}

export default EncabezadoPagina
