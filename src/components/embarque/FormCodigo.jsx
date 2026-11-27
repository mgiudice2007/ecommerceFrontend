import CamaraQr from './CamaraQr'
import './FormCodigo.css'

// Lector de la puerta de embarque: el codigo que se escribe, la busqueda y si la camara esta prendida
// viven en la vista. Mientras busca, una linea de escaner recorre el recuadro del QR; con la camara
// prendida, el recuadro muestra la camara y lee el QR del pase.
function FormCodigo({ codigo, buscando, camara, onCambiar, onBuscar, onAbrirCamara, onCerrarCamara, onEscanear, onErrorCamara }) {
  const buscar = (e) => {
    e.preventDefault()
    onBuscar()
  }

  return (
    <form className={`lector-pase ${buscando ? 'escaneando' : ''}`.trim()} onSubmit={buscar}>
      <span className="lector-pase-titulo">Puerta de embarque · Lector de pases</span>

      <div className="lector-pase-cuerpo">
        {camara ? (
          <CamaraQr onLeer={onEscanear} onError={onErrorCamara} />
        ) : (
          <div className="lector-pase-ventana" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2" />
            </svg>
            <span className="lector-pase-linea" />
          </div>
        )}

        <div className="lector-pase-campo">
          <label htmlFor="codigoEmbarque">Código del pase</label>
          <div className="lector-pase-fila">
            <input
              id="codigoEmbarque"
              name="codigoEmbarque"
              autoComplete="off"
              autoFocus
              value={codigo}
              onChange={(e) => onCambiar(e.target.value)}
              placeholder="BCA-XXXXXXXX"
              required
            />
            <button className="boton boton-accion" disabled={buscando || !codigo.trim()}>
              {buscando ? 'Leyendo…' : 'Leer pase'}
            </button>
          </div>
          <small>
            {camara
              ? 'Acercá el QR del pase a la cámara: se lee solo.'
              : 'Está debajo del QR, por ejemplo BCA-7F3K9QXM. O escaneá el QR con la cámara.'}
          </small>
          <button
            type="button"
            className="lector-pase-camara"
            onClick={camara ? onCerrarCamara : onAbrirCamara}
            aria-pressed={camara}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {camara ? 'Apagar cámara' : 'Escanear QR con la cámara'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default FormCodigo
