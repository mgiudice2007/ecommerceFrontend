import SelectorAsientos from '../SelectorAsientos'

function ElegirAsientos({ clase, pasajeros, asientos, mapa, error, ocupado, onCambio }) {
  return (
    <section>
      <h2 className="detalle-subtitulo">Elegí tus asientos</h2>
      <p className="texto-suave detalle-asientos-ayuda">
        Es gratis. Tocá un asiento libre o usá "Asiento aleatorio".
        {pasajeros.bebes > 0 && ' Los bebés viajan a upa, sin asiento propio.'}
      </p>
      <SelectorAsientos
        mapa={mapa}
        error={error}
        grupo={{
          titulo: `Clase ${clase.claseNombre}`,
          adultos: pasajeros.adultos,
          ninos: pasajeros.ninos,
          asientos,
        }}
        onCambio={onCambio}
        ocupado={ocupado}
      />
    </section>
  )
}

export default ElegirAsientos
