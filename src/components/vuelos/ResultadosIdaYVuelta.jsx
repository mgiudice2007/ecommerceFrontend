import ListaVuelos from './ListaVuelos'
import TramoVuelos from './TramoVuelos'

// Con la ida ya en el carrito (soloVuelta) solo se muestran las vueltas: el aviso de que la ida quedó en el
// carrito sale flotante desde el detalle del vuelo, en el momento en que se agrega
function ResultadosIdaYVuelta({ resultado, soloVuelta, consultaIda, consultaPasajeros }) {
  return (
    <>
      {!soloVuelta && (
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
