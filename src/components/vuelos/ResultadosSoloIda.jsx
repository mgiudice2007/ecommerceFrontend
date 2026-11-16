import Paginador from '../comunes/Paginador'
import ListaVuelos from './ListaVuelos'
import './ResultadosSoloIda.css'

function ResultadosSoloIda({ pagina, numeroPagina, consulta, onCambiarPagina }) {
  return (
    <>
      <p className="vuelos-cantidad">
        {pagina.totalElements === 1 ? '1 vuelo encontrado' : `${pagina.totalElements} vuelos encontrados`}
      </p>

      <ListaVuelos pagina={pagina} consulta={consulta} />

      <Paginador pagina={numeroPagina} totalPaginas={pagina.totalPages} onCambiar={onCambiarPagina} />
    </>
  )
}

export default ResultadosSoloIda
