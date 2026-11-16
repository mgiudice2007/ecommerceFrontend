import { useState } from 'react'
import { claseDe, rangoDePrecio, textoRango } from '../../utils/clases'
import { precio } from '../../utils/formato'
import { sinRuedita } from '../../utils/validaciones'
import ConfirmarPregunta from '../ConfirmarPregunta'
import Campo from '../comunes/Campo'

const FORM_VACIO = { claseId: '', asientosTotales: '', precio: '' }

function FormClase({ vuelo, clases, guardando, onAgregar }) {
  const [nueva, setNueva] = useState(FORM_VACIO)
  const [pregunta, setPregunta] = useState(null)

  const clasesLibres = clases.filter((c) => !vuelo.disponibilidades.some((d) => d.claseId === c.id))
  const claseNueva = claseDe(clases, nueva.claseId)
  const rango = rangoDePrecio(vuelo, clases, nueva.claseId, null)

  const pedirConfirmacion = (e) => {
    e.preventDefault()
    setPregunta({
      titulo: `¿Agregar la clase ${claseNueva?.nombre ?? ''}?`,
      detalle: [`Asientos: ${nueva.asientosTotales}`, `Precio por pasajero: ${precio(nueva.precio)}`],
      textoConfirmar: 'Sí, agregar',
      accion: () => onAgregar(nueva).then((ok) => ok && setNueva(FORM_VACIO)),
    })
  }

  return (
    <section className="tarjeta">
      <h2>Agregar clase</h2>
      {clasesLibres.length === 0 ? (
        <p className="texto-suave">El vuelo ya tiene todas las clases cargadas.</p>
      ) : (
        <form onSubmit={pedirConfirmacion}>
          <Campo id="claseId" etiqueta="Clase">
            <select
              id="claseId"
              value={nueva.claseId}
              onChange={(e) => setNueva({ ...nueva, claseId: e.target.value })}
              required
            >
              <option value="">Elegí una clase</option>
              {clasesLibres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo
            id="asientosTotales"
            etiqueta="Cantidad de asientos"
            ayuda={
              claseNueva?.maximoAsientos &&
              `Entre ${claseNueva.minimoAsientos ?? 1} y ${claseNueva.maximoAsientos} asientos para esta clase.`
            }
          >
            <input
              id="asientosTotales"
              type="number"
              onWheel={sinRuedita}
              min={claseNueva?.minimoAsientos ?? 1}
              max={claseNueva?.maximoAsientos}
              value={nueva.asientosTotales}
              onChange={(e) => setNueva({ ...nueva, asientosTotales: e.target.value })}
              required
            />
          </Campo>
          <Campo id="precioClase" etiqueta="Precio por pasajero" ayuda={textoRango(rango)}>
            <input
              id="precioClase"
              type="number"
              onWheel={sinRuedita}
              min={rango.desde ?? 1}
              max={rango.hasta ?? undefined}
              step="0.01"
              value={nueva.precio}
              onChange={(e) => setNueva({ ...nueva, precio: e.target.value })}
              required
            />
          </Campo>
          <button className="boton boton-primario boton-ancho" disabled={guardando}>
            Agregar clase
          </button>
        </form>
      )}

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default FormClase
