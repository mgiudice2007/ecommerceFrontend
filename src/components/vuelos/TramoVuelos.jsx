import './TramoVuelos.css'

function TramoVuelos({ numero, titulo, pagina, textoSinVuelos }) {
  const primero = pagina.content[0]

  return (
    <div className="vuelos-tramo">
      <span className="vuelos-tramo-numero">{numero}</span>
      <div>
        <h2>{titulo}</h2>
        <p className="texto-suave">
          {primero ? `${primero.origenCiudad} → ${primero.destinoCiudad}` : textoSinVuelos} · {pagina.totalElements}{' '}
          opciones
        </p>
      </div>
    </div>
  )
}

export default TramoVuelos
