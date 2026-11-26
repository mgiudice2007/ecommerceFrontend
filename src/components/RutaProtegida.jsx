import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

function RutaProtegida({ roles, children }) {
  const usuario = useSelector((state) => state.usuario.sesion)
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RutaProtegida
