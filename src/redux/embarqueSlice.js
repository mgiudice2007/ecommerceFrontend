import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { conToken, textoDeError, URL } from './conexion'

export const fetchPase = createAsyncThunk('embarque/fetchPase', async (codigo, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${URL}/api/embarque/${encodeURIComponent(codigo)}`, conToken())
    return data
  } catch (error) {
    return rejectWithValue(textoDeError(error))
  }
})

export const embarcarPasajero = createAsyncThunk('embarque/embarcarPasajero', async (codigo, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${URL}/api/embarque/${encodeURIComponent(codigo)}/embarcar`, null, conToken())
    return data
  } catch (error) {
    return rejectWithValue(textoDeError(error))
  }
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
        state.error = action.payload
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
        state.error = action.payload
      })
  },
})

export const { limpiarPase } = embarqueSlice.actions
export default embarqueSlice.reducer
