import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Cargando from '../../components/comunes/Cargando'
import GrillaNumeros from '../../components/comunes/GrillaNumeros'
import Mensaje from '../../components/comunes/Mensaje'
import SinDatos from '../../components/comunes/SinDatos'
import FiltrosUsuarios from '../../components/usuarios/FiltrosUsuarios'
import TablaUsuarios from '../../components/usuarios/TablaUsuarios'
import { avisar } from '../../redux/avisosSlice'
import { cambiarRol, fetchUsuarios, limpiarMensaje } from '../../redux/usuarioSlice'
import { ROLES } from '../../utils/roles'
import './Panel.css'

function Usuarios() {
  const dispatch = useDispatch()
  const { sesion, usuarios, mensaje, guardando, error } = useSelector((state) => state.usuario)

  // Roles elegidos que todavía no se guardaron, qué cuenta se está guardando y los filtros: solo importan a esta pantalla
  const [cambios, setCambios] = useState({})
  const [guardandoId, setGuardandoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')

  useEffect(() => {
    dispatch(fetchUsuarios())
  }, [dispatch])

  // Cuando el backend confirma el cambio de rol, su aviso sale como mensaje flotante
  useEffect(() => {
    if (mensaje) {
      dispatch(avisar(mensaje))
      dispatch(limpiarMensaje())
    }
  }, [mensaje, dispatch])

  // Una elección que ya coincide con el rol guardado deja de ser un cambio pendiente
  const pendientes = Object.fromEntries(
    Object.entries(cambios).filter(([id, rol]) => (usuarios ?? []).find((u) => u.id === Number(id))?.rol !== rol),
  )

  const elegirRol = (usuario, rol) => {
    const nuevos = { ...cambios }
    if (rol === usuario.rol) delete nuevos[usuario.id]
    else nuevos[usuario.id] = rol
    setCambios(nuevos)
  }

  const guardar = (usuario) => {
    setGuardandoId(usuario.id)
    dispatch(cambiarRol({ id: usuario.id, rol: cambios[usuario.id] }))
  }

  const texto = busqueda.trim().toLowerCase()
  const visibles = (usuarios ?? []).filter(
    (u) =>
      (!filtroRol || u.rol === filtroRol) &&
      (!texto || `${u.username} ${u.nombre} ${u.apellido} ${u.mail}`.toLowerCase().includes(texto)),
  )

  const cantidadPorRol = (rol) => (usuarios ?? []).filter((u) => u.rol === rol).length

  return (
    <>
      <EncabezadoPagina
        etiqueta="Administrador"
        titulo="Usuarios y permisos"
        subtitulo="Revisá las cuentas registradas y asigná el rol de cada una."
        acciones={
          <Link to="/panel/administradores" className="boton boton-claro">
            + Crear administrador
          </Link>
        }
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        {usuarios && (
          <GrillaNumeros
            columnas={ROLES.length}
            numeros={ROLES.map((r) => ({ rotulo: r.plural, valor: cantidadPorRol(r.valor) }))}
          />
        )}

        {error && <Mensaje>{error}</Mensaje>}

        <section className="tarjeta">
          <FiltrosUsuarios
            busqueda={busqueda}
            onBusqueda={setBusqueda}
            filtroRol={filtroRol}
            onFiltroRol={setFiltroRol}
            roles={ROLES}
          />

          {!usuarios && !error && <Cargando texto="Cargando usuarios…" />}
          {usuarios && visibles.length === 0 && <SinDatos>Ningún usuario coincide con la búsqueda.</SinDatos>}

          {visibles.length > 0 && (
            <TablaUsuarios
              usuarios={visibles}
              miUsername={sesion.username}
              roles={ROLES}
              cambios={pendientes}
              guardando={guardando ? guardandoId : null}
              onElegirRol={elegirRol}
              onGuardar={guardar}
            />
          )}
        </section>
      </div>
    </>
  )
}

export default Usuarios
