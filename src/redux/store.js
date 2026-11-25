import { configureStore } from '@reduxjs/toolkit'
import carritoReducer from './carritoSlice'
import catalogoReducer from './catalogoSlice'
import embarqueReducer from './embarqueSlice'
import ordenesReducer from './ordenesSlice'
import vuelosReducer from './vuelosSlice'

export const store = configureStore({
  reducer: {
    carrito: carritoReducer,
    catalogo: catalogoReducer,
    embarque: embarqueReducer,
    ordenes: ordenesReducer,
    vuelos: vuelosReducer,
  },
})
