import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import VolverArriba from './components/VolverArriba'
import { AuthProvider } from './context/AuthContext'
import Carrito from './views/Carrito'
import DetalleOrden from './views/DetalleOrden'
import DetalleVuelo from './views/DetalleVuelo'
import Inicio from './views/Inicio'
import Login from './views/Login'
import MisCompras from './views/MisCompras'
import Perfil from './views/Perfil'
import NoEncontrada from './views/NoEncontrada'
import Registro from './views/Registro'
import Vuelos from './views/Vuelos'
import CrearAdmin from './views/vendedor/CrearAdmin'
import FormVuelo from './views/vendedor/FormVuelo'
import GestionVuelo from './views/vendedor/GestionVuelo'
import PanelVuelos from './views/vendedor/PanelVuelos'
import Usuarios from './views/vendedor/Usuarios'

function App() {
  return (
    <AuthProvider>
      <VolverArriba />
      <Navbar />

      <main>
        <Routes>
          {/* Publicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/vuelos" element={<Vuelos />} />
          <Route path="/vuelos/:id" element={<DetalleVuelo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Solo compradores */}
          <Route
            path="/carrito"
            element={
              <RutaProtegida roles={['COMPRADOR']}>
                <Carrito />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-compras"
            element={
              <RutaProtegida roles={['COMPRADOR']}>
                <MisCompras />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-compras/:id"
            element={
              <RutaProtegida roles={['COMPRADOR']}>
                <DetalleOrden />
              </RutaProtegida>
            }
          />

          {/* Cualquier usuario logueado */}
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <Perfil />
              </RutaProtegida>
            }
          />

          {/* Solo el administrador: es el unico vendedor de la aerolinea */}
          <Route
            path="/panel"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <PanelVuelos />
              </RutaProtegida>
            }
          />
          <Route
            path="/panel/vuelos/nuevo"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <FormVuelo />
              </RutaProtegida>
            }
          />
          <Route
            path="/panel/vuelos/:id"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <GestionVuelo />
              </RutaProtegida>
            }
          />
          <Route
            path="/panel/vuelos/:id/editar"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <FormVuelo />
              </RutaProtegida>
            }
          />

          {/* Solo administradores */}
          <Route
            path="/panel/usuarios"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <Usuarios />
              </RutaProtegida>
            }
          />
          <Route
            path="/panel/administradores"
            element={
              <RutaProtegida roles={['ADMIN']}>
                <CrearAdmin />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>

      <Footer />
    </AuthProvider>
  )
}

export default App
