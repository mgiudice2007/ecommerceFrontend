import { useState } from 'react'
import { datosDeVuelo, problemaEnVuelo } from '../../utils/vuelos'
import ConfirmarPregunta from '../ConfirmarPregunta'
import Mensaje from '../comunes/Mensaje'
import CamposVuelo from './CamposVuelo'

const fechaHora = (valor) => `${valor.slice(8, 10)}/${valor.slice(5, 7)}/${valor.slice(0, 4)} ${valor.slice(11, 16)}`

function FormDatosVuelo({ vuelo, aeropuertos, categorias, guardando, onGuardar }) {
  const original = datosDeVuelo(vuelo)
  const [formData, setFormData] = useState(original)
  const [pregunta, setPregunta] = useState(null)
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

  const pedirConfirmacion = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    const cambios = CAMPOS.filter((c) => String(formData[c.clave]) !== String(original[c.clave])).map(
      (c) => `${c.nombre}: ${c.mostrar(original[c.clave])} → ${c.mostrar(formData[c.clave])}`,
    )
    if (cambios.length === 0) {
      setError('No hay cambios para guardar.')
      return
    }
    setPregunta({
      titulo: `¿Guardar los cambios del vuelo ${vuelo.numeroVuelo}?`,
      mensaje: 'Esto es lo que va a cambiar:',
      detalle: cambios,
      textoConfirmar: 'Sí, guardar',
      accion: () => onGuardar(formData),
    })
  }

  return (
    <section className="tarjeta panel-formulario">
      <h2>Datos del vuelo</h2>
      <p className="texto-suave">
        Cambiá solo lo que necesites. Antes de guardar vas a ver un resumen de los cambios. Las compras ya hechas no
        cambian.
      </p>

      {error && <Mensaje>{error}</Mensaje>}

      <form onSubmit={pedirConfirmacion}>
        <CamposVuelo
          formData={formData}
          setFormData={(datos) => {
            setFormData(datos)
            setError('')
          }}
          aeropuertos={aeropuertos}
          categorias={categorias}
        />

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

      <ConfirmarPregunta pregunta={pregunta} onCerrar={() => setPregunta(null)} />
    </section>
  )
}

export default FormDatosVuelo
