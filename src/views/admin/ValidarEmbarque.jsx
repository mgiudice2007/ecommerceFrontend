import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FormCodigo from '../../components/embarque/FormCodigo'
import ResultadoEmbarque from '../../components/embarque/ResultadoEmbarque'
import Mensaje from '../../components/comunes/Mensaje'
import { embarcarPasajero, fetchPase, limpiarPase } from '../../redux/embarqueSlice'

// El administrador escribe el código del pase (el que está debajo del QR) y ve si el pasajero puede embarcar
function ValidarEmbarque() {
  const dispatch = useDispatch()
  const { pase, loading, error } = useSelector((state) => state.embarque)
  const [codigo, setCodigo] = useState('')
  // Para distinguir "lo acabo de embarcar" (verde) de "ya habia embarcado antes" (ambar)
  const [recienEmbarcado, setRecienEmbarcado] = useState(false)

  const cambiarCodigo = (valor) => {
    setCodigo(valor)
    setRecienEmbarcado(false)
    if (pase || error) dispatch(limpiarPase())
  }

  const buscar = () => {
    setRecienEmbarcado(false)
    dispatch(fetchPase(codigo.trim()))
  }

  const embarcar = () => {
    setRecienEmbarcado(true)
    dispatch(embarcarPasajero(pase.codigoEmbarque))
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Administrador"
        titulo="Validar embarque"
        subtitulo="Ingresá el código del pase de embarque para ver si el pasajero puede subir al vuelo."
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        <FormCodigo codigo={codigo} buscando={loading && !pase} onCambiar={cambiarCodigo} onBuscar={buscar} />

        {error && <Mensaje>{error}</Mensaje>}
        {pase && (
          <ResultadoEmbarque pase={pase} embarcando={loading} recienEmbarcado={recienEmbarcado} onEmbarcar={embarcar} />
        )}
      </div>
    </>
  )
}

export default ValidarEmbarque
