import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import { AuthProvider } from './context/AuthContext'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Proximamente from './pages/Proximamente'
import Registro from './pages/Registro'
import Vuelos from './pages/Vuelos'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <main>
          <Routes>
            {/* Publicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/vuelos" element={<Vuelos />} />
            <Route path="/vuelos/:id" element={<Proximamente titulo="Detalle del vuelo" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Solo compradores */}
            <Route
              path="/carrito"
              element={
                <RutaProtegida roles={['COMPRADOR']}>
                  <Proximamente titulo="Mi carrito" />
                </RutaProtegida>
              }
            />
            <Route
              path="/mis-compras"
              element={
                <RutaProtegida roles={['COMPRADOR']}>
                  <Proximamente titulo="Mis compras" />
                </RutaProtegida>
              }
            />

            {/* Cualquier usuario logueado */}
            <Route
              path="/perfil"
              element={
                <RutaProtegida>
                  <Proximamente titulo="Mi perfil" />
                </RutaProtegida>
              }
            />

            {/* Vendedores y administradores */}
            <Route
              path="/panel"
              element={
                <RutaProtegida roles={['VENDEDOR', 'ADMIN']}>
                  <Proximamente titulo="Panel de vuelos" />
                </RutaProtegida>
              }
            />

            <Route path="*" element={<Proximamente titulo="Página no encontrada" />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
