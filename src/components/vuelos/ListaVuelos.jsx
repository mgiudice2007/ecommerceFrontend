import EstadoVacio from '../comunes/EstadoVacio'
import TarjetaVuelo from '../TarjetaVuelo'
import { usePortadas } from '../../hooks/usePortadas'
import './ListaVuelos.css'

function ListaVuelos({ pagina, consulta }) {
  const portadas = usePortadas(pagina.content.map((vuelo) => vuelo.id))

  return (
    <>
      {pagina.content.length === 0 && (
        <EstadoVacio
          nivel={3}
          titulo={pagina.mensaje ?? 'No encontramos vuelos con esos filtros'}
          texto="Probá con otro destino o sacá algún filtro."
        />
      )}
      <div className="vuelos-lista">
        {pagina.content.map((vuelo) => (
          <TarjetaVuelo key={vuelo.id} vuelo={vuelo} pasajeros={consulta} imagen={portadas[vuelo.id]} />
        ))}
      </div>
    </>
  )
}

export default ListaVuelos
