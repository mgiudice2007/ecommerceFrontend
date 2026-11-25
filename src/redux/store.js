import { configureStore } from '@reduxjs/toolkit'
import catalogoReducer from './catalogoSlice'
import embarqueReducer from './embarqueSlice'
import vuelosReducer from './vuelosSlice'

export const store = configureStore({
  reducer: {
    catalogo: catalogoReducer,
    embarque: embarqueReducer,
    vuelos: vuelosReducer,
  },
})
