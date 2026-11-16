import GrillaDestinos from './GrillaDestinos'
import TituloSeccion from './TituloSeccion'
import './SeccionMundo.css'

function SeccionMundo({ regiones, region, onCambiarRegion, vuelos, paisDe, portadas }) {
  return (
    <section className="inicio-mundo">
      <div className="contenedor">
        <TituloSeccion sobretitulo="Explorá el mundo" titulo="Vuelos internacionales">
          <div className="inicio-solapas" role="tablist">
            {regiones.map((r) => (
              <button
                key={r.categoria}
                role="tab"
                aria-selected={region === r.categoria}
                className={region === r.categoria ? 'activa' : ''}
                onClick={() => onCambiarRegion(r.categoria)}
              >
                {r.titulo}
              </button>
            ))}
          </div>
        </TituloSeccion>
        {vuelos.length > 0 ? (
          <GrillaDestinos vuelos={vuelos} paisDe={paisDe} portadas={portadas} />
        ) : (
          <p className="texto-suave">No hay vuelos publicados en esta región.</p>
        )}
      </div>
    </section>
  )
}

export default SeccionMundo
