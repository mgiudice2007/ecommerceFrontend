import OpcionClase from '../OpcionClase'

function ListaClases({ disponibilidades, clases, elegida, onElegir }) {
  return (
    <section>
      <h2 className="detalle-subtitulo">Seleccioná tu clase</h2>
      {disponibilidades.length === 0 ? (
        <p className="texto-suave">Todavía no hay asientos a la venta para este vuelo.</p>
      ) : (
        <div className="detalle-clases">
          {disponibilidades.map((d) => (
            <OpcionClase
              key={d.id}
              disponibilidad={d}
              clase={clases.find((c) => c.id === d.claseId)}
              seleccionada={elegida?.id === d.id}
              onElegir={onElegir}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default ListaClases
