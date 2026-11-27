import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clienteApi } from './conexion'
import { logout, vencerSesion } from './usuarioSlice'

export const fetchOrdenes = createAsyncThunk('ordenes/fetchOrdenes', async () => {
  const { data } = await clienteApi.get('/api/ordenes')
  return data
})

export const fetchOrden = createAsyncThunk('ordenes/fetchOrden', async (id) => {
  const { data } = await clienteApi.get(`/api/ordenes/${id}`)
  return data
})

// El pago: el backend devuelve la orden ya creada
export const confirmarCompra = createAsyncThunk('ordenes/confirmarCompra', async (pedido) => {
  const { data } = await clienteApi.post('/api/carrito/checkout', pedido)
  return data
})

// El backend devuelve la orden ya cancelada
export const cancelarOrden = createAsyncThunk('ordenes/cancelarOrden', async (id) => {
  const { data } = await clienteApi.post(`/api/ordenes/${id}/cancelar`)
  return data
})

// El PDF llega como archivo (blob): el store guarda solo su dirección local (blob:...) para que la vista lo baje
export const descargarPdf = createAsyncThunk('ordenes/descargarPdf', async (id) => {
  const { data } = await clienteApi.get(`/api/ordenes/${id}/pdf`, { responseType: 'blob' })
  return { id, url: URL.createObjectURL(data) }
})

const initialState = {
  ordenes: null,
  ordenActual: null,
  // Id de la orden que se acaba de pagar, hasta que la vista lo consume para ir a la pantalla de compra exitosa
  ordenConfirmada: null,
  mensaje: null,
  // PDF de la orden de compra listo para bajar ({ id, url }); se limpia apenas la vista lo descarga
  pdf: null,
  descargandoPdf: false,
  loading: false,
  guardando: false,
  error: null,
}

const ordenesSlice = createSlice({
  name: 'ordenes',
  initialState,
  reducers: {
    limpiarMensaje: (state) => {
      state.mensaje = null
    },
    pdfDescargado: (state) => {
      state.pdf = null
    },
    reiniciarConfirmada: (state) => {
      state.ordenConfirmada = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Al salir de la sesión no queda nada de las compras del usuario anterior
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(vencerSesion, () => initialState)
      .addCase(fetchOrdenes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrdenes.fulfilled, (state, action) => {
        state.loading = false
        state.ordenes = action.payload
      })
      .addCase(fetchOrdenes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchOrden.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrden.fulfilled, (state, action) => {
        state.loading = false
        state.ordenActual = action.payload
      })
      .addCase(fetchOrden.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(confirmarCompra.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      // La lista de compras cambió: queda sin cargar y se pide al entrar a "Mis compras"
      .addCase(confirmarCompra.fulfilled, (state, action) => {
        state.guardando = false
        state.ordenActual = action.payload
        state.ordenConfirmada = action.payload.id
        state.ordenes = null
      })
      .addCase(confirmarCompra.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(cancelarOrden.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(cancelarOrden.fulfilled, (state, action) => {
        state.guardando = false
        if (state.ordenes) {
          const indice = state.ordenes.findIndex((orden) => orden.id === action.payload.id)
          if (indice !== -1) {
            state.ordenes[indice] = action.payload
          }
        }
        if (state.ordenActual?.id === action.payload.id) {
          state.ordenActual = action.payload
        }
        state.mensaje = `Cancelaste la compra #${action.payload.id}. Los asientos volvieron a estar disponibles.`
      })
      .addCase(cancelarOrden.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(descargarPdf.pending, (state) => {
        state.descargandoPdf = true
        state.error = null
      })
      .addCase(descargarPdf.fulfilled, (state, action) => {
        state.descargandoPdf = false
        state.pdf = action.payload
      })
      .addCase(descargarPdf.rejected, (state, action) => {
        state.descargandoPdf = false
        state.error = action.error.message
      })
  },
})

export const { limpiarMensaje, pdfDescargado, reiniciarConfirmada } = ordenesSlice.actions
export default ordenesSlice.reducer
