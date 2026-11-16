import { textoPasajeros } from '../../utils/pasajeros'
import SelectorPasajeros from '../SelectorPasajeros'
import './CampoPasajeros.css'

function CampoPasajeros({ pasajeros, abierto, onAlternar, onCambiar }) {
  return (
    <div className="buscador-campo buscador-pasajeros">
      <label htmlFor="pasajeros">Pasajeros</label>
      <button id="pasajeros" type="button" onClick={onAlternar} aria-expanded={abierto}>
        {textoPasajeros(pasajeros)}
        <span aria-hidden="true">{abierto ? '▴' : '▾'}</span>
      </button>
      {abierto && (
        <div className="buscador-desplegable">
          <SelectorPasajeros pasajeros={pasajeros} onChange={onCambiar} />
          <button type="button" className="boton boton-primario boton-ancho" onClick={onAlternar}>
            Listo
          </button>
        </div>
      )}
    </div>
  )
}

export default CampoPasajeros
