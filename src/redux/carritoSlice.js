import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clienteApi } from './conexion'
import { confirmarCompra } from './ordenesSlice'
import { logout, vencerSesion } from './usuarioSlice'

export const fetchCarrito = createAsyncThunk('carrito/fetchCarrito', async () => {
  const { data } = await clienteApi.get('/api/carrito')
  return data
})

// Datos de los vuelos del carrito (fecha, aeropuertos, lugares). Si a un vuelo no se lo puede pedir, queda en null y el carrito se muestra igual
export const fetchVuelosDelCarrito = createAsyncThunk('carrito/fetchVuelosDelCarrito', async (vueloIds) => {
  const unicos = [...new Set(vueloIds)]
  const respuestas = await Promise.allSettled(unicos.map((id) => clienteApi.get(`/api/vuelos/${id}`)))
  const vuelos = {}
  unicos.forEach((id, i) => {
    vuelos[id] = respuestas[i].status === 'fulfilled' ? respuestas[i].value.data : null
  })
  return vuelos
})

// Las tres operaciones que cambian el carrito devuelven el carrito completo: reemplaza al del store, sin volver a pedirlo
export const agregarPasajes = createAsyncThunk('carrito/agregarPasajes', async (pasajes) => {
  const { data } = await clienteApi.post('/api/carrito/pasajes', pasajes)
  return data
})

export const cambiarCantidad = createAsyncThunk('carrito/cambiarCantidad', async ({ itemId, cantidad }) => {
  const { data } = await clienteApi.put(`/api/carrito/items/${itemId}`, { cantidad })
  return data
})

export const eliminarItem = createAsyncThunk('carrito/eliminarItem', async (itemId) => {
  const { data } = await clienteApi.delete(`/api/carrito/items/${itemId}`)
  return data
})

const initialState = {
  carrito: null,
  vuelosDelCarrito: {},
  // Verdadero desde que el backend confirma que se agregaron pasajes hasta que la vista lo consume
  pasajesAgregados: false,
  loading: false,
  guardando: false,
  error: null,
}

const carritoSlice = createSlice({
  name: 'carrito',
  initialState,
  reducers: {
    reiniciarAgregado: (state) => {
      state.pasajesAgregados = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.loading = false
        state.carrito = action.payload
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Al pagar, el backend vacía el carrito: queda sin cargar y se pide de nuevo la próxima vez
      .addCase(confirmarCompra.fulfilled, () => initialState)
      // Al salir de la sesión no queda nada del carrito del usuario anterior
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(vencerSesion, () => initialState)
      .addCase(fetchVuelosDelCarrito.fulfilled, (state, action) => {
        state.vuelosDelCarrito = { ...state.vuelosDelCarrito, ...action.payload }
      })
      .addCase(agregarPasajes.pending, (state) => {
        state.guardando = true
        state.pasajesAgregados = false
        state.error = null
      })
      // Agregar pasajes cambia los lugares libres de ese vuelo: los datos guardados de los vuelos ya no sirven
      .addCase(agregarPasajes.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
        state.vuelosDelCarrito = {}
        state.pasajesAgregados = true
      })
      .addCase(agregarPasajes.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(cambiarCantidad.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(cambiarCantidad.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(cambiarCantidad.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(eliminarItem.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(eliminarItem.fulfilled, (state, action) => {
        state.guardando = false
        state.carrito = action.payload
      })
      .addCase(eliminarItem.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
  },
})

export const { reiniciarAgregado } = carritoSlice.actions
export default carritoSlice.reducer
