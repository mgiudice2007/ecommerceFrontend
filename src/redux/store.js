import { configureStore } from '@reduxjs/toolkit'
import catalogoReducer from './catalogoSlice'
import embarqueReducer from './embarqueSlice'

export const store = configureStore({
  reducer: {
    catalogo: catalogoReducer,
    embarque: embarqueReducer,
  },
})
