import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// En los <input type="number">, girar la rueda del mouse encima cambia el valor
// sin que el usuario se de cuenta (por ejemplo un precio). Si pasa, sacamos el
// foco del campo: asi la rueda solo hace scroll de la pagina.
document.addEventListener('wheel', () => {
  if (document.activeElement?.type === 'number') {
    document.activeElement.blur()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
