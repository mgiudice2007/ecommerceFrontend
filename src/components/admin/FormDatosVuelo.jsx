import { useState } from 'react'
import { datosDeVuelo, problemaEnVuelo } from '../../utils/vuelos'
import Mensaje from '../comunes/Mensaje'
import CamposVuelo from './CamposVuelo'

const fechaHora = (valor) => `${valor.slice(8, 10)}/${valor.slice(5, 7)}/${valor.slice(0, 4)} ${valor.slice(11, 16)}`

function FormDatosVuelo({ vuelo, aeropuertos, categorias, guardando, onGuardar }) {
  const original = datosDeVuelo(vuelo)
  const [formData, setFormData] = useState(original)
  const [error, setError] = useState('')

  const nombreAeropuerto = (iata) => {
    const aeropuerto = aeropuertos.find((a) => a.codigoIata === iata)
    return aeropuerto ? `${aeropuerto.ciudad} (${iata})` : iata
  }
  const nombreCategoria = (id) => categorias.find((c) => String(c.id) === String(id))?.nombre ?? id

  const CAMPOS = [
    { clave: 'numeroVuelo', nombre: 'Número de vuelo', mostrar: (v) => v },
    { clave: 'categoriaId', nombre: 'Tipo de vuelo', mostrar: nombreCategoria },
    { clave: 'origenIata', nombre: 'Origen', mostrar: nombreAeropuerto },
    { clave: 'destinoIata', nombre: 'Destino', mostrar: nombreAeropuerto },
    { clave: 'fechaSalida', nombre: 'Salida', mostrar: fechaHora },
    { clave: 'fechaLlegada', nombre: 'Llegada', mostrar: fechaHora },
    { clave: 'descripcion', nombre: 'Descripción', mostrar: (v) => (v ? `"${v}"` : '(vacía)') },
  ]

  // El resumen de lo que se modificó se ve en la misma tarjeta, sin pedir confirmación aparte
  const cambios = CAMPOS.filter((c) => String(formData[c.clave]) !== String(original[c.clave])).map(
    (c) => `${c.nombre}: ${c.mostrar(original[c.clave])} → ${c.mostrar(formData[c.clave])}`,
  )

  const guardar = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    if (cambios.length === 0) {
      setError('No hay cambios para guardar.')
      return
    }
    onGuardar(formData)
  }

  return (
    <section className="tarjeta panel-formulario" data-plan="Torre de control · Plan de vuelo">
      <h2>Datos del vuelo</h2>
      <p className="texto-suave">
        Cambiá solo lo que necesites. Abajo ves un resumen de lo que modificaste antes de guardar. Las compras ya hechas no
        cambian.
      </p>

      {error && <Mensaje>{error}</Mensaje>}

      <form onSubmit={guardar}>
        <CamposVuelo
          formData={formData}
          setFormData={(datos) => {
            setFormData(datos)
            setError('')
          }}
          aeropuertos={aeropuertos}
          categorias={categorias}
        />

        {cambios.length > 0 && (
          <div className="panel-cambios">
            <strong>Cambios sin guardar:</strong>
            <ul>
              {cambios.map((cambio) => (
                <li key={cambio}>{cambio}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="panel-botones">
          <button className="boton boton-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="boton boton-secundario"
            onClick={() => {
              setFormData(original)
              setError('')
            }}
          >
            Descartar cambios
          </button>
        </div>
      </form>
    </section>
  )
}

export default FormDatosVuelo
