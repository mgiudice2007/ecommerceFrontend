import { configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist'
import storageSession from 'redux-persist/es/storage/session'
import avisosReducer from './avisosSlice'
import carritoReducer from './carritoSlice'
import catalogoReducer from './catalogoSlice'
import embarqueReducer from './embarqueSlice'
import { fijarToken } from './conexion'
import ordenesReducer from './ordenesSlice'
import usuarioReducer from './usuarioSlice'
import vuelosReducer from './vuelosSlice'

// La sesión sobrevive a F5: redux-persist guarda en sessionStorage solo el token, la sesión y el perfil
// (se borran al cerrar la pestaña). El resto del store se vuelve a pedir al backend
const usuarioPersistido = persistReducer(
  { key: 'usuario', storage: storageSession, whitelist: ['token', 'sesion', 'perfil'] },
  usuarioReducer,
)

export const store = configureStore({
  reducer: {
    avisos: avisosReducer,
    carrito: carritoReducer,
    catalogo: catalogoReducer,
    embarque: embarqueReducer,
    ordenes: ordenesReducer,
    usuario: usuarioPersistido,
    vuelos: vuelosReducer,
  },
  // Las acciones internas de redux-persist llevan funciones: se excluyen del chequeo de datos serializables
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
})

export const persistor = persistStore(store)

// El token de la sesión está en el store: cada vez que cambia (también al recuperarlo tras un F5) se lo pasa al cliente de axios
store.subscribe(() => fijarToken(store.getState().usuario.token))
