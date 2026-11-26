import './VistaTarjeta.css'

// Tarjeta de muestra que se completa mientras escribis. Con girada muestra el dorso
// (cuando estas escribiendo el codigo de seguridad), con una animacion de giro.
// El codigo no se muestra: aparecen puntos, uno por cada numero escrito.
function VistaTarjeta({ numero, titular, vencimiento, tipo, codigo = '', girada = false }) {
  return (
    <div className={`vista-tarjeta ${girada ? 'girada' : ''}`.trim()} aria-hidden="true">
      <div className="vista-tarjeta-giro">
        <div className="vista-tarjeta-cara vista-tarjeta-frente">
          <div className="vista-tarjeta-arriba">
            <span className="vista-tarjeta-chip" />
            <span className="vista-tarjeta-tipo">{tipo}</span>
          </div>
          <strong className="vista-tarjeta-numero">{numero || '•••• •••• •••• ••••'}</strong>
          <div className="vista-tarjeta-pie">
            <span>
              <small>Titular</small>
              {titular.trim() || 'NOMBRE APELLIDO'}
            </span>
            <span>
              <small>Vence</small>
              {vencimiento || 'MM/AA'}
            </span>
          </div>
        </div>

        <div className="vista-tarjeta-cara vista-tarjeta-dorso">
          <span className="vista-tarjeta-banda" />
          <div className="vista-tarjeta-firma">
            <span />
            <strong>{codigo ? '•'.repeat(codigo.length) : '•••'}</strong>
          </div>
          <small>Código de seguridad</small>
        </div>
      </div>
    </div>
  )
}

export default VistaTarjeta
