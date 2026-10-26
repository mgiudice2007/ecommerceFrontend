import './EncabezadoPagina.css'

function EncabezadoPagina({ etiqueta, titulo, subtitulo, acciones, imagen, children }) {
  const fondo = imagen ? { backgroundImage: `url("${imagen}")` } : undefined

  return (
    <section className={`encabezado-pagina ${imagen ? 'con-imagen' : ''}`} style={fondo}>
      <div className="contenedor">
        {children}
        <div className="encabezado-pagina-fila">
          <div>
            {etiqueta && <span className="encabezado-pagina-etiqueta">{etiqueta}</span>}
            <h1>{titulo}</h1>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          {acciones && <div className="encabezado-pagina-acciones">{acciones}</div>}
        </div>
      </div>
    </section>
  )
}

export default EncabezadoPagina
