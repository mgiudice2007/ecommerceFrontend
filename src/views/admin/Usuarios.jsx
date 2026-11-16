import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import Confirmacion from '../../components/Confirmacion'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import Cargando from '../../components/comunes/Cargando'
import GrillaNumeros from '../../components/comunes/GrillaNumeros'
import Mensaje from '../../components/comunes/Mensaje'
import SinDatos from '../../components/comunes/SinDatos'
import FiltrosUsuarios from '../../components/usuarios/FiltrosUsuarios'
import TablaUsuarios from '../../components/usuarios/TablaUsuarios'
import { useAuth } from '../../context/AuthContext'
import { nombreDeRol, ROLES } from '../../utils/roles'
import './Panel.css'

function Usuarios() {
  const { usuario: yo } = useAuth()

  const [usuarios, setUsuarios] = useState(null)
  const [cambios, setCambios] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(null)
  const [aGuardar, setAGuardar] = useState(null)

  useEffect(() => {
    api('/api/usuarios')
      .then(setUsuarios)
      .catch((err) => setError(err.message))
  }, [])

  const elegirRol = (usuario, rol) => {
    setExito('')
    const nuevos = { ...cambios }
    if (rol === usuario.rol) delete nuevos[usuario.id]
    else nuevos[usuario.id] = rol
    setCambios(nuevos)
  }

  const guardar = (usuario) => {
    const rol = cambios[usuario.id]
    const nombreRol = nombreDeRol(rol)
    setAGuardar(null)
    setError('')
    setExito('')
    setGuardando(usuario.id)
    api(`/api/usuarios/${usuario.id}/rol`, { method: 'PUT', body: { rol } })
      .then((actualizado) => {
        setUsuarios(usuarios.map((u) => (u.id === actualizado.id ? actualizado : u)))
        const pendientes = { ...cambios }
        delete pendientes[usuario.id]
        setCambios(pendientes)
        setExito(`${actualizado.username} ahora es ${nombreRol}. El cambio rige desde su próximo pedido.`)
      })
      .catch((err) => setError(err.message))
      .finally(() => setGuardando(null))
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
        {exito && <Mensaje tipo="exito">{exito}</Mensaje>}

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
              miUsername={yo.username}
              roles={ROLES}
              cambios={cambios}
              guardando={guardando}
              onElegirRol={elegirRol}
              onGuardar={setAGuardar}
            />
          )}
        </section>
      </div>

      {aGuardar && (
        <Confirmacion
          titulo="¿Cambiar el rol?"
          mensaje={`${aGuardar.username} va a pasar a ser ${nombreDeRol(cambios[aGuardar.id])}.`}
          textoConfirmar="Sí, cambiar"
          onConfirmar={() => guardar(aGuardar)}
          onCancelar={() => setAGuardar(null)}
        />
      )}
    </>
  )
}

export default Usuarios
