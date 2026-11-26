import { Link } from 'react-router-dom'
import Mensaje from '../comunes/Mensaje'
import ListaVuelos from './ListaVuelos'
import TramoVuelos from './TramoVuelos'

function ResultadosIdaYVuelta({ resultado, soloVuelta, consultaIda, consultaPasajeros }) {
  return (
    <>
      {soloVuelta ? (
        <Mensaje tipo="exito">
          ✓ Tu vuelo de ida ya está en el carrito. Ahora elegí el vuelo de vuelta. <Link to="/carrito">Ir al carrito</Link>
        </Mensaje>
      ) : (
        <>
          <TramoVuelos
            numero={1}
            titulo="Vuelos de ida"
            pagina={resultado.ida}
            textoSinVuelos="Sin vuelos para esta ruta"
          />
          <ListaVuelos pagina={resultado.ida} consulta={consultaIda} />
        </>
      )}

      <TramoVuelos
        numero={2}
        titulo="Vuelos de vuelta"
        pagina={resultado.vuelta}
        textoSinVuelos="Sin vuelos de regreso para esta ruta"
      />
      <ListaVuelos pagina={resultado.vuelta} consulta={consultaPasajeros} />
    </>
  )
}

export default ResultadosIdaYVuelta
