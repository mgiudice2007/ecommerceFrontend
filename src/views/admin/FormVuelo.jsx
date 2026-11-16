import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import CamposVuelo from '../../components/admin/CamposVuelo'
import Mensaje from '../../components/comunes/Mensaje'
import { useCatalogo } from '../../hooks/useCatalogo'
import { cuerpoVuelo, FORM_VUELO_VACIO, problemaEnVuelo } from '../../utils/vuelos'
import './Panel.css'

function FormVuelo() {
  const navigate = useNavigate()
  const aeropuertos = useCatalogo('/api/aeropuertos')
  const categorias = useCatalogo('/api/categorias')

  const [formData, setFormData] = useState(FORM_VUELO_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const problema = problemaEnVuelo(formData)
    setError(problema)
    if (problema) return

    setGuardando(true)
    api('/api/vuelos', { method: 'POST', body: cuerpoVuelo(formData) })
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
          {error && <Mensaje>{error}</Mensaje>}

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
