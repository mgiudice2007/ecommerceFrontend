import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import RutaProtegida from './components/RutaProtegida'
import VolverArriba from './components/VolverArriba'
import { AvisosProvider } from './context/AvisosContext'
import { fetchCarrito } from './redux/carritoSlice'
import { fetchAeropuertos, fetchCategorias, fetchClases } from './redux/catalogoSlice'
import { fetchPerfil, vencerSesion } from './redux/usuarioSlice'
import Carrito from './views/Carrito'
import Checkout from './views/Checkout'
import CompraExitosa from './views/CompraExitosa'
import DetalleOrden from './views/DetalleOrden'
import DetalleVuelo from './views/DetalleVuelo'
import Inicio from './views/Inicio'
import Login from './views/Login'
import MisCompras from './views/MisCompras'
import Perfil from './views/Perfil'
import NoEncontrada from './views/NoEncontrada'
import Registro from './views/Registro'
import Vuelos from './views/Vuelos'
import CrearAdmin from './views/admin/CrearAdmin'
import FormVuelo from './views/admin/FormVuelo'
import GestionVuelo from './views/admin/GestionVuelo'
import PanelVuelos from './views/admin/PanelVuelos'
import Usuarios from './views/admin/Usuarios'
import ValidarEmbarque from './views/admin/ValidarEmbarque'

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sesion = useSelector((state) => state.usuario.sesion)

  // El catálogo (aeropuertos, categorías y clases) se pide una sola vez al abrir la app; las vistas solo lo leen del store
  useEffect(() => {
    dispatch(fetchAeropuertos())
    dispatch(fetchCategorias())
    dispatch(fetchClases())
  }, [dispatch])

  // Al iniciar sesión se piden el perfil y, si es comprador, su carrito
  useEffect(() => {
    if (sesion) {
      dispatch(fetchPerfil())
    }
    if (sesion?.rol === 'COMPRADOR') {
      dispatch(fetchCarrito())
    }
  }, [sesion, dispatch])

  // Cuando vence el token se cierra la sesión y se vuelve al login
  useEffect(() => {
    if (!sesion) return
    const timer = setTimeout(() => {
      dispatch(vencerSesion())
      navigate('/login', { state: { sesionVencida: true } })
    }, sesion.vence - Date.now())
    return () => clearTimeout(timer)
  }, [sesion, dispatch, navigate])

  return (
    <>
      <AvisosProvider>
        <VolverArriba />
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/vuelos" element={<Vuelos />} />
            <Route path="/vuelos/:id" element={<DetalleVuelo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

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
              path="/compra-exitosa/:id"
              element={
                <RutaProtegida roles={['COMPRADOR']}>
                  <CompraExitosa />
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

            <Route
              path="/perfil"
              element={
                <RutaProtegida>
                  <Perfil />
                </RutaProtegida>
              }
            />

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
              path="/panel/embarque"
              element={
                <RutaProtegida roles={['ADMIN']}>
                  <ValidarEmbarque />
                </RutaProtegida>
              }
            />
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
      </AvisosProvider>
    </>
  )
}

export default App
