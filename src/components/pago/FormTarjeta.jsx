import { useState } from 'react'
import { precio } from '../../utils/formato'
import Campo from '../comunes/Campo'
import VistaTarjeta from './VistaTarjeta'

function FormTarjeta({ tarjeta, errores, credito, cuotas, total, onCambiar }) {
  // Mientras se escribe el codigo de seguridad la tarjeta de muestra se da vuelta
  const [mirandoDorso, setMirandoDorso] = useState(false)

  return (
    <div>
      <VistaTarjeta
        numero={tarjeta.numero}
        titular={tarjeta.titular}
        vencimiento={tarjeta.vencimiento}
        tipo={credito ? 'Crédito' : 'Débito'}
        codigo={tarjeta.codigo}
        girada={mirandoDorso}
      />

      <Campo
        id="numero"
        etiqueta="Número de tarjeta"
        ayuda="Para probar usá 4242 4242 4242 4242."
        error={errores.numero}
      >
        <input
          id="numero"
          name="numero"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={tarjeta.numero}
          onChange={onCambiar}
        />
      </Campo>

      <Campo id="titular" etiqueta="Nombre del titular" error={errores.titular}>
        <input
          id="titular"
          name="titular"
          autoComplete="cc-name"
          placeholder="Como figura en la tarjeta"
          value={tarjeta.titular}
          onChange={onCambiar}
        />
      </Campo>

      <div className="fila-campos">
        <Campo id="vencimiento" etiqueta="Vencimiento" error={errores.vencimiento}>
          <input
            id="vencimiento"
            name="vencimiento"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={tarjeta.vencimiento}
            onChange={onCambiar}
          />
        </Campo>

        <Campo id="codigo" etiqueta="Código de seguridad" error={errores.codigo}>
          <input
            id="codigo"
            name="codigo"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={tarjeta.codigo}
            onChange={onCambiar}
            onFocus={() => setMirandoDorso(true)}
            onBlur={() => setMirandoDorso(false)}
          />
        </Campo>
      </div>

      {credito && (
        <Campo id="cuotas" etiqueta="Cuotas">
          <select id="cuotas" name="cuotas" value={tarjeta.cuotas} onChange={onCambiar}>
            {cuotas.map((cantidad) => (
              <option key={cantidad} value={cantidad}>
                {cantidad === 1
                  ? `1 pago de ${precio(total)}`
                  : `${cantidad} cuotas de ${precio(total / cantidad)}`}
              </option>
            ))}
          </select>
        </Campo>
      )}
    </div>
  )
}

export default FormTarjeta
