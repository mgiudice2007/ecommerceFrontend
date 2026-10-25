import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import { paraInputFechaHora, precio } from '../../utils/formato'
import { cuerpoVuelo, problemaEnVuelo } from '../../utils/vuelos'
import CamposVuelo from './CamposVuelo'

// Los datos del vuelo como los usa el formulario
const datosDe = (vuelo) => ({
  numeroVuelo: vuelo.numeroVuelo,
  descripcion: vuelo.descripcion ?? '',
  categoriaId: String(vuelo.categoriaId),
  origenIata: vuelo.origenIata,
  destinoIata: vuelo.destinoIata,
  fechaSalida: paraInputFechaHora(vuelo.fechaSalida),
  fechaLlegada: paraInputFechaHora(vuelo.fechaLlegada),
  precio: String(vuelo.precio),
})

// "2026-11-06T07:15" -> "06/11/2026 07:15"
const fechaHora = (valor) => `${valor.slice(8, 10)}/${valor.slice(5, 7)}/${valor.slice(0, 4)} ${valor.slice(11, 16)}`

// Pestaña "Datos del vuelo": el admin cambia solo lo que necesita. Al guardar se
// muestra el resumen de lo que cambio y se pide confirmacion.
function TabDatos({ vuelo }) {
  const navigate = useNavigate()
  // Datos del catalogo para los selects (si falla un pedido, ese select queda vacio)
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
  const [cambios, setCambios] = useState(null) // la lista que se muestra en el cartel de confirmacion
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const nombreAeropuerto = (iata) => {
    const aeropuerto = aeropuertos.find((a) => a.codigoIata === iata)
    return aeropuerto ? `${aeropuerto.ciudad} (${iata})` : iata
  }
  const nombreCategoria = (id) => categorias.find((c) => String(c.id) === String(id))?.nombre ?? id

  // Cada campo con su nombre y como mostrarlo en el resumen
  const CAMPOS = [
    { clave: 'numeroVuelo', nombre: 'Número de vuelo', mostrar: (v) => v },
    { clave: 'categoriaId', nombre: 'Tipo de vuelo', mostrar: nombreCategoria },
    { clave: 'origenIata', nombre: 'Origen', mostrar: nombreAeropuerto },
    { clave: 'destinoIata', nombre: 'Destino', mostrar: nombreAeropuerto },
    { clave: 'fechaSalida', nombre: 'Salida', mostrar: fechaHora },
    { clave: 'fechaLlegada', nombre: 'Llegada', mostrar: fechaHora },
    { clave: 'precio', nombre: 'Precio base', mostrar: precio },
    { clave: 'descripcion', nombre: 'Descripción', mostrar: (v) => (v ? `"${v}"` : '(vacía)') },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    // Solo los campos que cambiaron: "Salida: 06/11/2026 07:15 → 06/11/2026 09:00"
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
      // Una vez guardado vuelve al panel, que muestra el mensaje
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
