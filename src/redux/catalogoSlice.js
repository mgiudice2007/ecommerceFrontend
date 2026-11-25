import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { textoDeError, URL } from './conexion'

// Cada lista se pide una sola vez: si ya está cargada, el thunk no vuelve a llamar al backend (condition)
const yaCargada = (lista) => (_, { getState }) => getState().catalogo[lista].length === 0

export const fetchAeropuertos = createAsyncThunk(
  'catalogo/fetchAeropuertos',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${URL}/api/aeropuertos`)
      return data
    } catch (error) {
      return rejectWithValue(textoDeError(error))
    }
  },
  { condition: yaCargada('aeropuertos') },
)

export const fetchCategorias = createAsyncThunk(
  'catalogo/fetchCategorias',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${URL}/api/categorias`)
      return data
    } catch (error) {
      return rejectWithValue(textoDeError(error))
    }
  },
  { condition: yaCargada('categorias') },
)

export const fetchClases = createAsyncThunk(
  'catalogo/fetchClases',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${URL}/api/clases`)
      return data
    } catch (error) {
      return rejectWithValue(textoDeError(error))
    }
  },
  { condition: yaCargada('clases') },
)

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
        state.error = action.payload
      })
      .addCase(fetchCategorias.pending, (state) => {
        state.error = null
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(fetchClases.pending, (state) => {
        state.error = null
      })
      .addCase(fetchClases.fulfilled, (state, action) => {
        state.clases = action.payload
      })
      .addCase(fetchClases.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export default catalogoSlice.reducer
