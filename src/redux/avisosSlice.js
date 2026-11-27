import { createSlice } from '@reduxjs/toolkit'

// Mensajes flotantes de éxito ("Se guardaron los cambios", "Cancelaste la compra"...). No llama al backend:
// las vistas despachan `avisar` cuando consumen el `mensaje` de otro slice.
// `avisar` recibe el texto, o { texto, enlace: { a, texto } } si el aviso lleva un enlace ("Ir al carrito")
const avisosSlice = createSlice({
  name: 'avisos',
  initialState: {
    lista: [],
    ultimoId: 0,
  },
  reducers: {
    avisar: (state, action) => {
      const { texto, enlace = null } = typeof action.payload === 'string' ? { texto: action.payload } : action.payload
      state.ultimoId += 1
      state.lista = [...state.lista, { id: state.ultimoId, texto, enlace }]
    },
    cerrarAviso: (state, action) => {
      state.lista = state.lista.filter((aviso) => aviso.id !== action.payload)
    },
  },
})

export const { avisar, cerrarAviso } = avisosSlice.actions
export default avisosSlice.reducer
