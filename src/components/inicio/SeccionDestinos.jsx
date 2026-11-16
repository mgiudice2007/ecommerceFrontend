import GrillaDestinos from './GrillaDestinos'
import TituloSeccion from './TituloSeccion'

function SeccionDestinos({ sobretitulo, titulo, vuelos, paisDe, portadas }) {
  return (
    <section className="contenedor inicio-seccion">
      <TituloSeccion sobretitulo={sobretitulo} titulo={titulo} />
      <GrillaDestinos vuelos={vuelos} paisDe={paisDe} portadas={portadas} />
    </section>
  )
}

export default SeccionDestinos
