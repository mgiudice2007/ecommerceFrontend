import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import { paraInputFechaHora } from '../../utils/formato'
import { cuerpoVuelo, problemaEnVuelo } from '../../utils/vuelos'
import CamposVuelo from './CamposVuelo'

const datosDe = (vuelo) => ({
  tramo: ['AEP', 'EZE'].includes(vuelo.origenIata) ? 'ida' : 'vuelta',
  numeroVuelo: vuelo.numeroVuelo,
  descripcion: vuelo.descripcion ?? '',
  categoriaId: String(vuelo.categoriaId),
  origenIata: vuelo.origenIata,
  destinoIata: vuelo.destinoIata,
  fechaSalida: paraInputFechaHora(vuelo.fechaSalida),
  fechaLlegada: paraInputFechaHora(vuelo.fechaLlegada),
})

const fechaHora = (valor) => `${valor.slice(8, 10)}/${valor.slice(5, 7)}/${valor.slice(0, 4)} ${valor.slice(11, 16)}`

function TabDatos({ vuelo }) {
  const navigate = useNavigate()
  const [aeropuertos, setAeropuertos] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    api('/api/aeropuertos')
      .then((data) => setAeropuertos(data))
      .catch(() => setAeropuertos([]))
    api('/api/categorias')
      .then((data) => setCategorias(data))
      .catch(() => setCategorias([]))
  }, [])

  const original = datosDe(vuelo)
  const [formData, setFormData] = useState(original)
  const [cambios, setCambios] = useState(null)
  const [guardando, setGuardando] = useState(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    const lista = CAMPOS.filter((c) => String(formData[c.clave]) !== String(original[c.clave])).map(
      (c) => `${c.nombre}: ${c.mostrar(original[c.clave])} → ${c.mostrar(formData[c.clave])}`,
    )
    if (lista.length === 0) {
      setError('No hay cambios para guardar.')
      return
    }
    setCambios(lista)
  }

  const guardar = () => {
    setCambios(null)
    setGuardando(true)
    api(`/api/vuelos/${vuelo.id}`, { method: 'PUT', body: cuerpoVuelo(formData) })
      .then((actualizado) =>
        navigate('/panel', { state: { mensaje: `Se guardaron los cambios del vuelo ${actualizado.numeroVuelo}.` } }),
      )
      .catch((err) => {
        setError(err.message)
        setGuardando(false)
      })
  }

  return (
    <div>
      <section className="tarjeta panel-formulario">
        <h2>Datos del vuelo</h2>
        <p className="texto-suave">
          Cambiá solo lo que necesites. Antes de guardar vas a ver un resumen de los cambios. Las compras ya hechas no
          cambian.
        </p>

        {error && <div className="mensaje mensaje-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
      </section>

      {cambios && (
        <Confirmacion
          titulo={`¿Guardar los cambios del vuelo ${vuelo.numeroVuelo}?`}
          mensaje="Esto es lo que va a cambiar:"
          detalle={cambios}
          textoConfirmar="Sí, guardar"
          onConfirmar={guardar}
          onCancelar={() => setCambios(null)}
        />
      )}
    </div>
  )
}

export default TabDatos
