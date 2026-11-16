import { Link } from 'react-router-dom'

function textoDelBoton({ agregando, estaLogueado, faltanAsientos, eligiendoIda }) {
  if (agregando) return 'Agregando…'
  if (!estaLogueado) return 'Iniciá sesión para comprar'
  if (faltanAsientos > 0) return `Elegí ${faltanAsientos === 1 ? '1 asiento más' : `${faltanAsientos} asientos más`}`
  if (eligiendoIda) return 'Agregar y elegir vuelo de vuelta →'
  return 'Agregar al carrito'
}

function AccionesCompra({
  agregado,
  estaLogueado,
  esComprador,
  agregando,
  faltanAsientos,
  eligiendoIda,
  onAgregar,
  onAgregarOtros,
}) {
  if (agregado) {
    return (
      <>
        <Link to="/carrito" className="boton boton-primario boton-ancho">
          Ir al carrito →
        </Link>
        <button type="button" className="boton boton-secundario boton-ancho detalle-ir-carrito" onClick={onAgregarOtros}>
          Agregar otros pasajeros a este vuelo
        </button>
      </>
    )
  }

  if (estaLogueado && !esComprador) {
    return <p className="texto-suave">Solo las cuentas de comprador pueden comprar pasajes.</p>
  }

  return (
    <>
      <button
        className="boton boton-primario boton-ancho"
        onClick={() => onAgregar(eligiendoIda)}
        disabled={agregando || (estaLogueado && faltanAsientos > 0)}
      >
        {textoDelBoton({ agregando, estaLogueado, faltanAsientos, eligiendoIda })}
      </button>
      {eligiendoIda && estaLogueado && faltanAsientos <= 0 && (
        <button
          type="button"
          className="boton boton-secundario boton-ancho"
          onClick={() => onAgregar(false)}
          disabled={agregando}
        >
          Agregar solo este vuelo
        </button>
      )}
    </>
  )
}

export default AccionesCompra
