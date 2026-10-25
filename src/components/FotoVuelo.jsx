import './FotoVuelo.css'

// Muestra la portada de un vuelo. No le pide nada al backend: la pantalla que lo usa
// trae la imagen y se la pasa por props (como PostCard en el ejemplo de clase).
// Sin imagen muestra un fondo azul con el codigo del destino. Las listas de vuelos
// (resultados, carrito, mis compras y panel) lo usan siempre asi, para que todas las
// tarjetas se vean iguales; las fotos se ven en el inicio y en el detalle del vuelo.
function FotoVuelo({ imagen, destinoIata, destinoCiudad }) {
  if (imagen) {
    return <img className="foto-vuelo" src={imagen} alt={`Foto de ${destinoCiudad}`} />
  }

  return (
    <div className="foto-vuelo foto-vuelo-vacia" aria-hidden="true">
      <span>{destinoIata || '✈'}</span>
    </div>
  )
}

export default FotoVuelo
