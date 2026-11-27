import { useRef, useState } from 'react'
import './SelectorAsientos.css'
import MinimapaAvion from './MinimapaAvion'
import Cargando from './comunes/Cargando'
import Mensaje from './comunes/Mensaje'

// Filas que entran a la vista en el avion grande; las demas se ven scrolleando o con el minimapa
const FILAS_VISIBLES = 9

function SelectorAsientos({ mapa, error, grupo, onCambio, ocupado }) {
  const pasajeros = grupo.adultos + grupo.ninos
  const elegidos = grupo.asientos
  // El avion grande: el minimapa lo scrollea a traves de esta referencia
  const avionGrande = useRef(null)
  // La fila de letras: para saber si ya quedó fija arriba al scrollear
  const filaLetras = useRef(null)
  // Que parte del avion grande se ve, como fraccion del total ({ inicio, alto }), y si las letras quedaron
  // fijas arriba (ahi necesitan fondo para tapar las filas que pasan por debajo). Lo actualiza el scroll.
  const [ventana, setVentana] = useState(null)

  if (error) {
    return <Mensaje>{error}</Mensaje>
  }

  if (!mapa) {
    return <Cargando texto="Cargando el mapa de asientos…" />
  }

  const estaOcupado = (codigo) => mapa.ocupados.includes(codigo)
  const estaElegido = (codigo) => elegidos.includes(codigo)
  const estadoDe = (codigo) => (estaElegido(codigo) ? 'elegido' : estaOcupado(codigo) ? 'ocupado' : 'libre')

  // Si la cabina entra entera (por ejemplo la ejecutiva), no hay scroll ni minimapa
  const conMinimapa = mapa.filas.length > FILAS_VISIBLES
  // Solo la cabina de adelante (la que arranca en la fila 1) lleva la punta del avión;
  // las de atrás, como la económica, se dibujan con la punta cuadrada
  const conNariz = mapa.filas[0]?.numero === 1
  // Antes del primer scroll se calcula la franja con la cantidad de filas
  const ventanaActual = ventana ?? {
    inicio: 0,
    alto: Math.min(1, FILAS_VISIBLES / mapa.filas.length),
    letrasFijas: false,
  }

  const alScrollear = (e) => {
    const avion = e.currentTarget
    // Las letras están fijas cuando ya subieron hasta el borde de arriba de la caja
    const distancia = filaLetras.current.getBoundingClientRect().top - avion.getBoundingClientRect().top
    setVentana({
      inicio: avion.scrollTop / avion.scrollHeight,
      alto: avion.clientHeight / avion.scrollHeight,
      letrasFijas: avion.scrollTop > 0 && distancia <= 1,
    })
  }

  // Mueve el avion grande para que la franja arranque en `fraccion` (0 = adelante, 1 = atras)
  const mover = (fraccion, suave) => {
    const avion = avionGrande.current
    if (!avion) return
    const tope = Math.max(0, Math.min(1, fraccion))
    avion.scrollTo({ top: tope * avion.scrollHeight, behavior: suave ? 'smooth' : 'auto' })
  }

  // Lleva el avion grande hasta un asiento, dejándolo en el medio de la vista
  const irAAsiento = (codigo) => {
    const indice = mapa.filas.findIndex((fila) => fila.asientos.includes(codigo))
    mover((indice + 0.5) / mapa.filas.length - ventanaActual.alto / 2, true)
  }

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
    // El avion grande va adonde cayó, para que se vea qué asiento tocó
    irAAsiento(alAzar)
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
            {elegidos[i] ? (
              // Tocar el asiento elegido lleva el avion grande hasta él
              <button type="button" className="selector-asientos-ir" onClick={() => irAAsiento(elegidos[i])}>
                {elegidos[i]}
              </button>
            ) : (
              <strong>Sin elegir</strong>
            )}
          </li>
        ))}
      </ul>

      <div className="selector-asientos-leyenda">
        <span><i className="asiento" /> Libre</span>
        <span><i className="asiento elegido" /> Elegido</span>
        <span><i className="asiento ocupado" /> Ocupado</span>
      </div>

      <div className="selector-asientos-mapas">
        {conMinimapa && (
          <MinimapaAvion
            filas={mapa.filas}
            letras={mapa.letras}
            ventana={ventanaActual}
            estadoDe={estadoDe}
            conNariz={conNariz}
            onMover={mover}
          />
        )}

        {/* El avion grande tiene todas las filas: con muchas filas se scrollea la caja de afuera (asi la barra
            queda separada del avion) y el minimapa lo acompaña */}
        <div
          id="mapa-asientos"
          ref={avionGrande}
          className={`selector-asientos-scroll ${conMinimapa ? 'con-scroll' : ''}`.trim()}
          onScroll={conMinimapa ? alScrollear : undefined}
        >
          <div className={`selector-asientos-avion ${conNariz ? 'con-nariz' : ''}`.trim()}>
            <div ref={filaLetras} className={`fila-asientos letras ${ventanaActual.letrasFijas ? 'fijas' : ''}`.trim()}>
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
        </div>
      </div>
    </section>
  )
}

export default SelectorAsientos
