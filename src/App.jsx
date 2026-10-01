import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import VolverArriba from './components/VolverArriba'
import { AuthProvider } from './context/AuthContext'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import DetalleOrden from './pages/DetalleOrden'
import DetalleVuelo from './pages/DetalleVuelo'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import MisCompras from './pages/MisCompras'
import Perfil from './pages/Perfil'
import NoEncontrada from './pages/NoEncontrada'
import Registro from './pages/Registro'
import Vuelos from './pages/Vuelos'
import CrearAdmin from './pages/vendedor/CrearAdmin'
import FormVuelo from './pages/vendedor/FormVuelo'
import GestionVuelo from './pages/vendedor/GestionVuelo'
import PanelVuelos from './pages/vendedor/PanelVuelos'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
              path="/checkout"
              element={
                <RutaProtegida roles={['COMPRADOR']}>
                  <Checkout />
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

            {/* Vendedores y administradores */}
            <Route
              path="/panel"
              element={
                <RutaProtegida roles={['VENDEDOR', 'ADMIN']}>
                  <PanelVuelos />
                </RutaProtegida>
              }
            />
            <Route
              path="/panel/vuelos/nuevo"
              element={
                <RutaProtegida roles={['VENDEDOR', 'ADMIN']}>
                  <FormVuelo />
                </RutaProtegida>
              }
            />
            <Route
              path="/panel/vuelos/:id"
              element={
                <RutaProtegida roles={['VENDEDOR', 'ADMIN']}>
                  <GestionVuelo />
                </RutaProtegida>
              }
            />
            <Route
              path="/panel/vuelos/:id/editar"
              element={
                <RutaProtegida roles={['VENDEDOR', 'ADMIN']}>
                  <FormVuelo />
                </RutaProtegida>
              }
            />

            {/* Solo administradores */}
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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
