import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import FormAdministrador from '../../components/admin/FormAdministrador'
import { useAvisos } from '../../context/AvisosContext'
import { limpiarMensaje, reiniciarError } from '../../redux/usuarioSlice'
import './Panel.css'

function CrearAdmin() {
  const { avisar } = useAvisos()
  const dispatch = useDispatch()
  const { mensaje, administradoresCreados } = useSelector((state) => state.usuario)

  useEffect(() => {
    dispatch(reiniciarError())
  }, [dispatch])

  // Cuando el backend confirma que se creó el administrador, se avisa con un mensaje flotante
  useEffect(() => {
    if (mensaje) {
      avisar(mensaje)
      dispatch(limpiarMensaje())
    }
  }, [mensaje, avisar, dispatch])

  return (
    <>
      <EncabezadoPagina
        etiqueta="Solo administradores"
        titulo="Crear administrador"
        subtitulo="Un administrador publica y gestiona los vuelos de la aerolínea, y administra las cuentas de usuario."
      >
        <Link to="/panel/usuarios">← Volver a usuarios</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        <FormAdministrador key={administradoresCreados} />
      </div>
    </>
  )
}

export default CrearAdmin
