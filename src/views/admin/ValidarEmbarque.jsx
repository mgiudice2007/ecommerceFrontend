import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FormCodigo from '../../components/embarque/FormCodigo'
import ResultadoEmbarque from '../../components/embarque/ResultadoEmbarque'
import Mensaje from '../../components/comunes/Mensaje'
import { embarcarPasajero, fetchPase, limpiarPase } from '../../redux/embarqueSlice'

// El administrador escanea el QR del pase con la cámara o escribe el código que está debajo,
// y ve si el pasajero puede embarcar
function ValidarEmbarque() {
  const dispatch = useDispatch()
  const { pase, loading, error } = useSelector((state) => state.embarque)
  const [codigo, setCodigo] = useState('')
  // Para distinguir "lo acabo de embarcar" (verde) de "ya habia embarcado antes" (ambar)
  const [recienEmbarcado, setRecienEmbarcado] = useState(false)
  const [camara, setCamara] = useState(false)
  const [avisoCamara, setAvisoCamara] = useState('')

  const cambiarCodigo = (valor) => {
    setCodigo(valor)
    setRecienEmbarcado(false)
    if (pase || error) dispatch(limpiarPase())
  }

  const buscarCodigo = (valor) => {
    setRecienEmbarcado(false)
    dispatch(fetchPase(valor.trim()))
  }

  const buscar = () => buscarCodigo(codigo)

  const abrirCamara = () => {
    setAvisoCamara('')
    cambiarCodigo('')
    setCamara(true)
  }

  // Lo que lee la cámara es el código del pase: se apaga la cámara y se busca como si se hubiera escrito
  const escanear = (leido) => {
    setCamara(false)
    setCodigo(leido.trim())
    buscarCodigo(leido)
  }

  const fallaCamara = (mensaje) => {
    setCamara(false)
    setAvisoCamara(mensaje)
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
        subtitulo="Escaneá el QR del pase de embarque o ingresá su código para ver si el pasajero puede subir al vuelo."
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        <FormCodigo
          codigo={codigo}
          buscando={loading && !pase}
          camara={camara}
          onCambiar={cambiarCodigo}
          onBuscar={buscar}
          onAbrirCamara={abrirCamara}
          onCerrarCamara={() => setCamara(false)}
          onEscanear={escanear}
          onErrorCamara={fallaCamara}
        />

        {avisoCamara && <Mensaje>{avisoCamara}</Mensaje>}
        {error && <Mensaje>{error}</Mensaje>}
        {pase && (
          <ResultadoEmbarque pase={pase} embarcando={loading} recienEmbarcado={recienEmbarcado} onEmbarcar={embarcar} />
        )}
      </div>
    </>
  )
}

export default ValidarEmbarque
