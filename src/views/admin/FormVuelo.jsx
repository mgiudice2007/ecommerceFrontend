import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import { cuerpoVuelo, problemaEnVuelo } from '../../utils/vuelos'
import CamposVuelo from './CamposVuelo'
import './Panel.css'

const FORM_VACIO = {
  numeroVuelo: '',
  descripcion: '',
  categoriaId: '',
  origenIata: '',
  destinoIata: '',
  fechaSalida: '',
  fechaLlegada: '',
}

// Publicar un vuelo nuevo (/panel/vuelos/nuevo). Para cambiar un vuelo que ya existe
// se usa la pestaña "Datos del vuelo" de la gestion (TabDatos).
function FormVuelo() {
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

  const [formData, setFormData] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    setGuardando(true)
    api('/api/vuelos', { method: 'POST', body: cuerpoVuelo(formData) })
      // Un vuelo nuevo nace sin asientos ni fotos: lo mandamos a su pagina para cargarlos
      .then((vuelo) => navigate(`/panel/vuelos/${vuelo.id}`, { state: { recienCreado: true } }))
      .catch((err) => {
        setError(err.message)
        setGuardando(false)
      })
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Panel de vuelos"
        titulo="Publicar un vuelo nuevo"
        subtitulo="Cargá los datos del vuelo. Después le agregás las clases con sus asientos y precios, los descuentos y las fotos."
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        <section className="tarjeta panel-formulario">
          {error && <div className="mensaje mensaje-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <CamposVuelo
              formData={formData}
              setFormData={setFormData}
              aeropuertos={aeropuertos}
              categorias={categorias}
            />

            <div className="panel-botones">
              <button className="boton boton-primario" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Publicar vuelo'}
              </button>
              <Link to="/panel" className="boton boton-secundario">
                Cancelar
              </Link>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default FormVuelo
