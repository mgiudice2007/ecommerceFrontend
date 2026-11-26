import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { avisar } from '../redux/avisosSlice'
import EncabezadoPagina from '../components/EncabezadoPagina'
import FormPerfil from '../components/perfil/FormPerfil'
import SellosViaje from '../components/perfil/SellosViaje'
import { fetchOrdenes } from '../redux/ordenesSlice'
import { fetchPerfil, limpiarMensaje } from '../redux/usuarioSlice'
import { fechaLarga, millas } from '../utils/formato'
import { sellosDeViaje } from '../utils/ordenes'
import './Perfil.css'
import Cargando from '../components/comunes/Cargando'
import Etiqueta from '../components/comunes/Etiqueta'
import Mensaje from '../components/comunes/Mensaje'

// Renglon de abajo del pasaporte (la "zona legible por maquina"), armado con los datos del usuario
const lineaPasaporte = (usuario) =>
  `P<ARG${usuario.apellido ?? ''}<<${usuario.nombre ?? usuario.username}`
    .toUpperCase()
    .replace(/\s+/g, '<')
    .padEnd(40, '<')
    .slice(0, 40)

const NOMBRES_DE_ROL = {
  COMPRADOR: 'Comprador',
  ADMIN: 'Administrador',
}

function Perfil() {
  const dispatch = useDispatch()
  const { perfil, mensaje, error } = useSelector((state) => state.usuario)
  const { ordenes } = useSelector((state) => state.ordenes)
  const { aeropuertos } = useSelector((state) => state.catalogo)
  const esComprador = perfil?.rol === 'COMPRADOR'

  // Las compras se piden para armar los sellos de viaje del pasaporte (solo compradores)
  useEffect(() => {
    if (esComprador && !ordenes) {
      dispatch(fetchOrdenes())
    }
  }, [esComprador, ordenes, dispatch])

  // El perfil se pide al iniciar sesión; solo se vuelve a pedir si no llegó
  useEffect(() => {
    if (!perfil) {
      dispatch(fetchPerfil())
    }
  }, [perfil, dispatch])

  // Cuando el backend confirma que se guardaron los datos, se avisa con un mensaje flotante
  useEffect(() => {
    if (mensaje) {
      dispatch(avisar(mensaje))
      dispatch(limpiarMensaje())
    }
  }, [mensaje, dispatch])

  if (!perfil) {
    return (
      <div className="contenedor pagina">
        {error ? <Mensaje>{error}</Mensaje> : <Cargando texto="Cargando perfil…" />}
      </div>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" subtitulo="Tus datos de cuenta y del pasajero titular." />

      <div className="contenedor sobre-encabezado perfil">
        <div className="perfil-layout">
          <aside className="tarjeta perfil-cuenta">
            <div className="pasaporte-tapa">
              <span>Pasaporte · Passport</span>
              <small>República Argentina · BCA Airlines</small>
            </div>
            <span className="perfil-avatar" aria-hidden="true">
              {perfil.nombre?.[0] ?? perfil.username[0]}
            </span>
            <h2>
              {perfil.nombre} {perfil.apellido}
            </h2>
            <Etiqueta>{NOMBRES_DE_ROL[perfil.rol]}</Etiqueta>

            <dl>
              <dt>Usuario</dt>
              <dd>{perfil.username}</dd>
              <dt>Correo electrónico</dt>
              <dd>{perfil.mail}</dd>
              <dt>Miembro desde</dt>
              <dd>{fechaLarga(perfil.fechaRegistro)}</dd>
              {perfil.rol === 'COMPRADOR' && (
                <>
                  <dt>Millas</dt>
                  <dd className="perfil-millas">
                    <span className="sello">✈ {millas(perfil.millas)}</span>
                  </dd>
                </>
              )}
            </dl>
            <code className="pasaporte-mrz" aria-hidden="true">
              {lineaPasaporte(perfil)}
            </code>
          </aside>

          <FormPerfil perfil={perfil} />

          {esComprador && <SellosViaje sellos={sellosDeViaje(ordenes, aeropuertos)} />}
        </div>
      </div>
    </>
  )
}

export default Perfil
