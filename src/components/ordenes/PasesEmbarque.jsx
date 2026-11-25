import PaseEmbarque from './PaseEmbarque'
import './PaseEmbarque.css'

// Un pase por persona y por vuelo. Las compras viejas (de antes de pedir los datos de los pasajeros) no tienen pases.
function PasesEmbarque({ items, anulados }) {
  const pases = items.flatMap((item) => (item.pasajes ?? []).map((pasaje) => ({ item, pasaje })))
  if (pases.length === 0) return null

  return (
    <section className="pases-embarque">
      <h2>{pases.length === 1 ? 'Tu pase de embarque' : 'Tus pases de embarque'}</h2>
      {pases.map(({ item, pasaje }) => (
        <PaseEmbarque key={pasaje.id} pasaje={pasaje} item={item} anulado={anulados} />
      ))}
    </section>
  )
}

export default PasesEmbarque
