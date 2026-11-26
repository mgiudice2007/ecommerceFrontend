import { configureStore } from '@reduxjs/toolkit'
import carritoReducer from './carritoSlice'
import catalogoReducer from './catalogoSlice'
import embarqueReducer from './embarqueSlice'
import { fijarToken } from './conexion'
import ordenesReducer from './ordenesSlice'
import usuarioReducer from './usuarioSlice'
import vuelosReducer from './vuelosSlice'

export const store = configureStore({
  reducer: {
    carrito: carritoReducer,
    catalogo: catalogoReducer,
    embarque: embarqueReducer,
    ordenes: ordenesReducer,
    usuario: usuarioReducer,
    vuelos: vuelosReducer,
  },
})

// El token de la sesión está en el store: cada vez que cambia se lo pasa al cliente de axios
store.subscribe(() => fijarToken(store.getState().usuario.token))
