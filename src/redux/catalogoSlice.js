import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clienteApi } from './conexion'

export const fetchAeropuertos = createAsyncThunk('catalogo/fetchAeropuertos', async () => {
  const { data } = await clienteApi.get('/api/aeropuertos')
  return data
})

export const fetchCategorias = createAsyncThunk('catalogo/fetchCategorias', async () => {
  const { data } = await clienteApi.get('/api/categorias')
  return data
})

export const fetchClases = createAsyncThunk('catalogo/fetchClases', async () => {
  const { data } = await clienteApi.get('/api/clases')
  return data
})

const catalogoSlice = createSlice({
  name: 'catalogo',
  initialState: { aeropuertos: [], categorias: [], clases: [], error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAeropuertos.pending, (state) => {
        state.error = null
      })
      .addCase(fetchAeropuertos.fulfilled, (state, action) => {
        state.aeropuertos = action.payload
      })
      .addCase(fetchAeropuertos.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchCategorias.pending, (state) => {
        state.error = null
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchClases.pending, (state) => {
        state.error = null
      })
      .addCase(fetchClases.fulfilled, (state, action) => {
        state.clases = action.payload
      })
      .addCase(fetchClases.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export default catalogoSlice.reducer
