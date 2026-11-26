import { createSlice } from '@reduxjs/toolkit'

// Mensajes flotantes de éxito ("Se guardaron los cambios", "Cancelaste la compra"...). No llama al backend:
// las vistas despachan `avisar` cuando consumen el `mensaje` de otro slice
const avisosSlice = createSlice({
  name: 'avisos',
  initialState: {
    lista: [],
    ultimoId: 0,
  },
  reducers: {
    avisar: (state, action) => {
      state.ultimoId += 1
      state.lista = [...state.lista, { id: state.ultimoId, texto: action.payload }]
    },
    cerrarAviso: (state, action) => {
      state.lista = state.lista.filter((aviso) => aviso.id !== action.payload)
    },
  },
})

export const { avisar, cerrarAviso } = avisosSlice.actions
export default avisosSlice.reducer
