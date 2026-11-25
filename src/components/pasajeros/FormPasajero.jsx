import { TIPOS_DOCUMENTO, tituloPersona } from '../../utils/datosPasajeros'
import { hoy } from '../../utils/formato'
import CampoFecha from '../CampoFecha'
import Campo from '../comunes/Campo'

// Los datos de una persona que viaja. No guarda nada: avisa cada cambio con onCambiar(clave, campo, valor).
function FormPasajero({ persona, vuelos, errores, onCambiar }) {
  const id = (campo) => `${persona.clave}-${campo}`
  const cambiar = (e) => onCambiar(persona.clave, e.target.name, e.target.value)

  return (
    <fieldset className="form-pasajero">
      <legend>{tituloPersona(persona)}</legend>
      <p className="texto-suave form-pasajero-vuelos">
        Viaja en {vuelos.map((vuelo) => `${vuelo.origen} → ${vuelo.destino} (${vuelo.numeroVuelo})`).join(' y ')}
      </p>

      <div className="fila-campos">
        <Campo id={id('nombre')} etiqueta="Nombre" error={errores.nombre}>
          <input
            id={id('nombre')}
            name="nombre"
            autoComplete="off"
            value={persona.nombre}
            onChange={cambiar}
            aria-invalid={Boolean(errores.nombre)}
          />
        </Campo>
        <Campo id={id('apellido')} etiqueta="Apellido" error={errores.apellido}>
          <input
            id={id('apellido')}
            name="apellido"
            autoComplete="off"
            value={persona.apellido}
            onChange={cambiar}
            aria-invalid={Boolean(errores.apellido)}
          />
        </Campo>
      </div>

      <div className="fila-campos">
        <Campo id={id('tipoDocumento')} etiqueta="Tipo de documento">
          <select id={id('tipoDocumento')} name="tipoDocumento" value={persona.tipoDocumento} onChange={cambiar}>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id={id('documento')} etiqueta="Número de documento" error={errores.documento}>
          <input
            id={id('documento')}
            name="documento"
            autoComplete="off"
            value={persona.documento}
            onChange={cambiar}
            aria-invalid={Boolean(errores.documento)}
          />
        </Campo>
      </div>

      <Campo id={id('fechaNacimiento')} etiqueta="Fecha de nacimiento" error={errores.fechaNacimiento}>
        <CampoFecha
          id={id('fechaNacimiento')}
          value={persona.fechaNacimiento}
          max={hoy()}
          onChange={(valor) => onCambiar(persona.clave, 'fechaNacimiento', valor)}
        />
      </Campo>
    </fieldset>
  )
}

export default FormPasajero
