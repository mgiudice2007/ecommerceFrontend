import './Confirmacion.css'

// Pregunta de confirmación dibujada con React (no es el confirm del navegador). Solo para acciones que no se pueden deshacer.
// Escape cancela: el foco arranca en el botón seguro ("No, volver"), así que el teclado ya está dentro del cuadro.
function Confirmacion({ titulo, mensaje, detalle, textoConfirmar = 'Confirmar', peligro = false, onConfirmar, onCancelar }) {
  return (
    <div className="confirmacion-fondo" onClick={onCancelar}>
      <div
        className="confirmacion tarjeta"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmacion-titulo"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCancelar()}
      >
        <div className="confirmacion-cabecera">
          <small>Aviso de la tripulación</small>
          <h2 id="confirmacion-titulo">{titulo}</h2>
        </div>
        <div className="confirmacion-cuerpo">
          {mensaje && <p>{mensaje}</p>}
          {detalle && (
            <ul className="confirmacion-detalle">
              {detalle.map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="confirmacion-botones">
          <button className="boton boton-secundario" onClick={onCancelar} autoFocus>
            No, volver
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
