import './PestaniasGestion.css'

function PestaniasGestion({ pestanias, activa, onElegir }) {
  return (
    <div className="gestion-pestanias" role="tablist">
      {pestanias.map((p) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={activa === p.id}
          className={activa === p.id ? 'activa' : ''}
          onClick={() => onElegir(p.id)}
        >
          {p.titulo}
        </button>
      ))}
    </div>
  )
}

export default PestaniasGestion
