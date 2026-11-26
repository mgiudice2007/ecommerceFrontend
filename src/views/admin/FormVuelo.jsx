import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import CamposVuelo from '../../components/admin/CamposVuelo'
import Mensaje from '../../components/comunes/Mensaje'
import { crearVuelo, reiniciarGuardado } from '../../redux/vuelosSlice'
import { cuerpoVuelo, FORM_VUELO_VACIO, problemaEnVuelo } from '../../utils/vuelos'
import './Panel.css'

function FormVuelo() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { aeropuertos, categorias } = useSelector((state) => state.catalogo)
  const { vueloGuardado, guardando, error: errorDelBackend } = useSelector((state) => state.vuelos)

  const [formData, setFormData] = useState(FORM_VUELO_VACIO)
  const [problema, setProblema] = useState('')

  // Al abrir el formulario no puede quedar el error de otra pantalla
  useEffect(() => {
    dispatch(reiniciarGuardado())
  }, [dispatch])

  // Cuando el backend confirma que el vuelo se creó, se pasa a cargarle las clases
  useEffect(() => {
    if (vueloGuardado) {
      dispatch(reiniciarGuardado())
      navigate(`/panel/vuelos/${vueloGuardado.id}`, { state: { recienCreado: true } })
    }
  }, [vueloGuardado, dispatch, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    const encontrado = problemaEnVuelo(formData)
    setProblema(encontrado)
    if (encontrado) return

    dispatch(crearVuelo(cuerpoVuelo(formData)))
  }

  const error = problema || errorDelBackend

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
