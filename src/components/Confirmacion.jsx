import './Confirmacion.css'

// Cartel propio para confirmar una accion (reemplaza al window.confirm del navegador).
// No guarda estado: el componente padre decide cuando mostrarlo (renderizado condicional)
// y recibe por props lo que tiene que hacer al confirmar o al cancelar.
// detalle (opcional): lista de textos, por ejemplo lo que va a cambiar ("Precio: $100 → $120")
function Confirmacion({ titulo, mensaje, detalle, textoConfirmar = 'Confirmar', peligro = false, onConfirmar, onCancelar }) {
  return (
    // Tocar el fondo oscuro tambien cierra el cartel
    <div className="confirmacion-fondo" onClick={onCancelar}>
      {/* stopPropagation: un click dentro del cartel no llega al fondo */}
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
