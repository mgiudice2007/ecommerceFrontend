import { vuelosDe } from '../../utils/datosPasajeros'
import FormPasajero from './FormPasajero'
import './PasoPasajeros.css'

function PasoPasajeros({ personas, items, errores, onCambiar }) {
  return (
    <section className="tarjeta paso-pasajeros">
      <h2>Datos de los pasajeros</h2>
      <p className="texto-suave">
        Cargá los datos tal como figuran en el documento de cada persona que viaja. El pasaje sale a nombre de quien
        escribas acá y no se puede cambiar después.
      </p>
      {personas.map((persona) => (
        <FormPasajero
          key={persona.clave}
          persona={persona}
          vuelos={vuelosDe(persona, items)}
          errores={errores[persona.clave] ?? {}}
          onCambiar={onCambiar}
        />
      ))}
    </section>
  )
}

export default PasoPasajeros
