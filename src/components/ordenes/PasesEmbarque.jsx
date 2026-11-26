import PaseEmbarque from './PaseEmbarque'
import './PaseEmbarque.css'

// Un pase por persona y por vuelo. Las compras viejas (de antes de pedir los datos de los pasajeros) no tienen pases.
// Con imprimir (pantalla de compra exitosa) los pases salen de a uno de la ranura de una
// maquina de check-in, como si se estuvieran imprimiendo.
function PasesEmbarque({ items, anulados, imprimir = false }) {
  const pases = items.flatMap((item) => (item.pasajes ?? []).map((pasaje) => ({ item, pasaje })))
  if (pases.length === 0) return null

  return (
    <section className={`pases-embarque ${imprimir ? 'imprimiendo' : ''}`.trim()}>
      <h2>{pases.length === 1 ? 'Tu pase de embarque' : 'Tus pases de embarque'}</h2>

      {imprimir && (
        <div className="impresora" aria-hidden="true">
          <span className="impresora-luz" />
          <span className="impresora-texto">BCA Airlines · Check-in · Imprimiendo pases</span>
          <span className="impresora-ranura" />
        </div>
      )}

      {pases.map(({ item, pasaje }, i) => (
        <div key={pasaje.id} className="pase-salida" style={imprimir ? { animationDelay: `${0.6 + i * 1.1}s` } : undefined}>
          <PaseEmbarque pasaje={pasaje} item={item} anulado={anulados} />
        </div>
      ))}
    </section>
  )
}

export default PasesEmbarque
