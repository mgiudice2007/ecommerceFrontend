import { createContext, useContext, useRef, useState } from 'react'
import Avisos from '../components/comunes/Avisos'

const AvisosContext = createContext(null)

const SEGUNDOS_VISIBLE = 6

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const contador = useRef(0)

  const cerrar = (id) => setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))

  const avisar = (texto) => {
    contador.current += 1
    const id = contador.current
    setAvisos((actuales) => [...actuales, { id, texto }])
    setTimeout(() => cerrar(id), SEGUNDOS_VISIBLE * 1000)
  }

  return (
    <AvisosContext.Provider value={{ avisar }}>
      {children}
      <Avisos avisos={avisos} onCerrar={cerrar} />
    </AvisosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAvisos = () => useContext(AvisosContext)
