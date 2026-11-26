import TarjetaCompra from './TarjetaCompra'

// Un grupo de Mis compras (proximos viajes, viajes realizados o canceladas) con su cantidad
function SeccionCompras({ titulo, compras, portadas, cancelandoId, onCancelar }) {
  return (
    <section className="compras-seccion">
      <h2>
        {titulo} <span>{compras.length}</span>
      </h2>
      <div className="compras-lista">
        {compras.map((orden) => (
          <TarjetaCompra
            key={orden.id}
            orden={orden}
            imagen={portadas[orden.items[0].vueloId]}
            cancelando={cancelandoId === orden.id}
            onCancelar={onCancelar}
          />
        ))}
      </div>
    </section>
  )
}

export default SeccionCompras
