import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Envuelve una pagina que necesita sesion.
// roles: lista de roles que pueden entrar, por ejemplo ['COMPRADOR'].
function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    // Lo mandamos al login y guardamos a donde queria ir, para volver despues
    return <Navigate to="/login" state={{ desde: location.pathname + location.search }} replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RutaProtegida
