import './SelectorAsientos.css'

function SelectorAsientos({ mapa, error, grupo, onCambio, ocupado }) {
  const pasajeros = grupo.adultos + grupo.ninos
  const elegidos = grupo.asientos

  if (error) {
    return <div className="mensaje mensaje-error">{error}</div>
  }

  if (!mapa) {
    return <p className="texto-suave">Cargando el mapa de asientos…</p>
  }

  const estaOcupado = (codigo) => mapa.ocupados.includes(codigo)
  const estaElegido = (codigo) => elegidos.includes(codigo)

  const tocarAsiento = (codigo) => {
    if (estaOcupado(codigo)) return
    if (estaElegido(codigo)) {
      onCambio(elegidos.filter((c) => c !== codigo))
    } else if (elegidos.length < pasajeros) {
      onCambio([...elegidos, codigo])
    }
  }

  const asientoAleatorio = () => {
    const libres = []
    mapa.filas.forEach((fila) => {
      fila.asientos.forEach((codigo) => {
        if (!estaOcupado(codigo) && !estaElegido(codigo)) libres.push(codigo)
      })
    })
    if (libres.length === 0) return
    const alAzar = libres[Math.floor(Math.random() * libres.length)]
    onCambio([...elegidos, alAzar])
  }

  const nombres = []
  for (let i = 1; i <= grupo.adultos; i++) nombres.push(`Adulto ${i}`)
  for (let i = 1; i <= grupo.ninos; i++) nombres.push(`Niño ${i}`)

  const mitad = mapa.letras.length / 2

  return (
    <section className="tarjeta selector-asientos">
      <div className="selector-asientos-encabezado">
        <div>
          <h3>{grupo.titulo}</h3>
          <p className="texto-suave">
            Elegí {pasajeros === 1 ? 'un asiento' : `${pasajeros} asientos`} · {elegidos.length} de {pasajeros} elegidos
          </p>
        </div>
        <button
          type="button"
          className="boton boton-secundario"
          onClick={asientoAleatorio}
          disabled={ocupado || elegidos.length >= pasajeros}
        >
          🎲 Asiento aleatorio
        </button>
      </div>

      <ul className="selector-asientos-pasajeros">
        {nombres.map((nombre, i) => (
          <li key={nombre}>
            <span>{nombre}</span>
            <strong>{elegidos[i] ?? 'Sin elegir'}</strong>
          </li>
        ))}
      </ul>

      <div className="selector-asientos-leyenda">
        <span><i className="asiento" /> Libre</span>
        <span><i className="asiento elegido" /> Elegido</span>
        <span><i className="asiento ocupado" /> Ocupado</span>
      </div>

      <div className="selector-asientos-avion">
        <div className="fila-asientos letras">
          <span />
          {mapa.letras.map((letra, i) => (
            <span key={letra} className={i === mitad ? 'despues-del-pasillo' : ''}>
              {letra}
            </span>
          ))}
        </div>

        {mapa.filas.map((fila) => (
          <div key={fila.numero} className="fila-asientos">
            <span className="numero-fila">{fila.numero}</span>
            {fila.asientos.map((codigo, i) => (
              <button
                key={codigo}
                type="button"
                className={`asiento ${estaOcupado(codigo) ? 'ocupado' : ''} ${estaElegido(codigo) ? 'elegido' : ''} ${
                  i === mitad ? 'despues-del-pasillo' : ''
                }`}
                onClick={() => tocarAsiento(codigo)}
                disabled={ocupado || estaOcupado(codigo)}
                aria-label={`Asiento ${codigo}${estaOcupado(codigo) ? ', ocupado' : ''}${estaElegido(codigo) ? ', elegido' : ''}`}
                aria-pressed={estaElegido(codigo)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default SelectorAsientos
