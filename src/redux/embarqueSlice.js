import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clienteApi } from './conexion'

export const fetchPase = createAsyncThunk('embarque/fetchPase', async (codigo) => {
  const { data } = await clienteApi.get(`/api/embarque/${encodeURIComponent(codigo)}`)
  return data
})

export const embarcarPasajero = createAsyncThunk('embarque/embarcarPasajero', async (codigo) => {
  const { data } = await clienteApi.post(`/api/embarque/${encodeURIComponent(codigo)}/embarcar`)
  return data
})

const embarqueSlice = createSlice({
  name: 'embarque',
  initialState: { pase: null, loading: false, error: null },
  reducers: {
    limpiarPase: (state) => {
      state.pase = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPase.pending, (state) => {
        state.loading = true
        state.error = null
        state.pase = null
      })
      .addCase(fetchPase.fulfilled, (state, action) => {
        state.loading = false
        state.pase = action.payload
      })
      .addCase(fetchPase.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(embarcarPasajero.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // El backend devuelve el pase ya embarcado: reemplaza al que se estaba mostrando, sin volver a pedirlo
      .addCase(embarcarPasajero.fulfilled, (state, action) => {
        state.loading = false
        state.pase = action.payload
      })
      .addCase(embarcarPasajero.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { limpiarPase } = embarqueSlice.actions
export default embarqueSlice.reducer
