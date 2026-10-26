import './Confirmacion.css'

function Confirmacion({ titulo, mensaje, detalle, textoConfirmar = 'Confirmar', peligro = false, onConfirmar, onCancelar }) {
  return (
    <div className="confirmacion-fondo" onClick={onCancelar}>
      <div className="confirmacion tarjeta" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{titulo}</h2>
        {mensaje && <p>{mensaje}</p>}
        {detalle && (
          <ul className="confirmacion-detalle">
            {detalle.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        )}
        <div className="confirmacion-botones">
          <button className="boton boton-secundario" onClick={onCancelar}>
            Volver
          </button>
          <button className={`boton ${peligro ? 'boton-peligro' : 'boton-primario'}`} onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Confirmacion
