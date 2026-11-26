import './FormCodigo.css'

// Lector de la puerta de embarque: el codigo que se escribe y la busqueda viven en la vista.
// Mientras busca, una linea de escaner recorre el recuadro del QR.
function FormCodigo({ codigo, buscando, onCambiar, onBuscar }) {
  const buscar = (e) => {
    e.preventDefault()
    onBuscar()
  }

  return (
    <form className={`lector-pase ${buscando ? 'escaneando' : ''}`.trim()} onSubmit={buscar}>
      <span className="lector-pase-titulo">Puerta de embarque · Lector de pases</span>

      <div className="lector-pase-cuerpo">
        <div className="lector-pase-ventana" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2" />
          </svg>
          <span className="lector-pase-linea" />
        </div>

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
          <small>Está debajo del QR, por ejemplo BCA-7F3K9QXM.</small>
        </div>
      </div>
    </form>
  )
}

export default FormCodigo
