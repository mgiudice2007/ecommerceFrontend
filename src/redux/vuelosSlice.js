import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { consultasDeBusqueda } from '../utils/busqueda'
import { asientosDe, estaOperativo } from '../utils/vuelos'
import { clienteApi } from './conexion'

const POR_PAGINA_PANEL = 20

// Foto de portada de un vuelo (la primera de su lista) como imagen lista para un <img>; null si no tiene fotos
const pedirPortada = async (vueloId) => {
  const { data: fotos } = await clienteApi.get('/api/fotos', { params: { vueloId } })
  if (fotos.length === 0) return null
  const { data: imagen } = await clienteApi.get(`/api/fotos/${fotos[0].id}`)
  return `data:${imagen.tipo};base64,${imagen.file}`
}

// Inicio: los vuelos que se pueden comprar hoy
export const fetchVuelosDestacados = createAsyncThunk('vuelos/fetchVuelosDestacados', async () => {
  const { data } = await clienteApi.get('/api/vuelos', { params: { page: 0, size: 60 } })
  return data.content.filter((vuelo) => estaOperativo(vuelo) && vuelo.hayStock)
})

// Portadas de varios vuelos a la vez. Si a un vuelo no se le puede pedir la foto, queda en null y la página se muestra igual
export const fetchPortadas = createAsyncThunk('vuelos/fetchPortadas', async (vueloIds) => {
  const unicos = [...new Set(vueloIds)]
  const respuestas = await Promise.allSettled(unicos.map((id) => pedirPortada(id)))
  const portadas = {}
  unicos.forEach((id, i) => {
    portadas[id] = respuestas[i].status === 'fulfilled' ? respuestas[i].value : null
  })
  return portadas
})

// Búsqueda de vuelos: la consulta es el texto de la URL. Si el viaje es de ida y vuelta se piden los dos tramos
export const fetchBusqueda = createAsyncThunk('vuelos/fetchBusqueda', async (consulta) => {
  const tramos = consultasDeBusqueda(consulta)
  const { data: ida } = await clienteApi.get('/api/vuelos', { params: tramos.ida })
  if (!tramos.vuelta) {
    return { consulta, ida, vuelta: null }
  }
  const { data: vuelta } = await clienteApi.get('/api/vuelos', { params: tramos.vuelta })
  return { consulta, ida, vuelta }
})

export const fetchVuelo = createAsyncThunk('vuelos/fetchVuelo', async (id) => {
  const { data } = await clienteApi.get(`/api/vuelos/${id}`)
  return data
})

// Panel del administrador
export const fetchResumenPanel = createAsyncThunk('vuelos/fetchResumenPanel', async () => {
  const { data } = await clienteApi.get('/api/vuelos/resumen')
  return data
})

export const fetchVuelosPanel = createAsyncThunk('vuelos/fetchVuelosPanel', async ({ pagina, texto }) => {
  const { data } = await clienteApi.get('/api/vuelos', {
    params: { page: pagina, size: POR_PAGINA_PANEL, texto: texto || undefined },
  })
  return { pagina, texto, datos: data }
})

export const cambiarEstadoVuelo = createAsyncThunk('vuelos/cambiarEstadoVuelo', async ({ id, estado }) => {
  const { data } = await clienteApi.patch(`/api/vuelos/${id}/estado`, { estado })
  return { id, ...data }
})

const vuelosSlice = createSlice({
  name: 'vuelos',
  initialState: {
    vuelosDestacados: [],
    portadas: {},
    resultadoBusqueda: null,
    vueloActual: null,
    vuelosPanel: { pagina: 0, texto: '', datos: null },
    resumenPanel: null,
    mensaje: null,
    loading: false,
    error: null,
  },
  reducers: {
    limpiarMensaje: (state) => {
      state.mensaje = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVuelosDestacados.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelosDestacados.fulfilled, (state, action) => {
        state.loading = false
        state.vuelosDestacados = action.payload
      })
      .addCase(fetchVuelosDestacados.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchPortadas.fulfilled, (state, action) => {
        state.portadas = { ...state.portadas, ...action.payload }
      })
      .addCase(fetchBusqueda.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusqueda.fulfilled, (state, action) => {
        state.loading = false
        state.resultadoBusqueda = action.payload
      })
      .addCase(fetchBusqueda.rejected, (state, action) => {
        state.loading = false
        state.resultadoBusqueda = null
        state.error = action.error.message
      })
      .addCase(fetchVuelo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelo.fulfilled, (state, action) => {
        state.loading = false
        state.vueloActual = action.payload
      })
      .addCase(fetchVuelo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchResumenPanel.pending, (state) => {
        state.error = null
      })
      .addCase(fetchResumenPanel.fulfilled, (state, action) => {
        state.resumenPanel = action.payload
      })
      .addCase(fetchResumenPanel.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchVuelosPanel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelosPanel.fulfilled, (state, action) => {
        state.loading = false
        state.vuelosPanel = action.payload
      })
      .addCase(fetchVuelosPanel.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(cambiarEstadoVuelo.pending, (state) => {
        state.error = null
      })
      // El backend devuelve el nuevo estado: se actualiza la lista y los totales del panel sin volver a pedirlos
      .addCase(cambiarEstadoVuelo.fulfilled, (state, action) => {
        const { id, estado, mensaje } = action.payload
        const lista = state.vuelosPanel.datos.content
        const indice = lista.findIndex((vuelo) => vuelo.id === id)
        if (indice !== -1) {
          if (estado === 'ELIMINADO') {
            const asientos = asientosDe(lista[indice])
            state.vuelosPanel.datos.content = lista.filter((vuelo) => vuelo.id !== id)
            state.vuelosPanel.datos.totalElements -= 1
            state.resumenPanel.vuelos -= 1
            state.resumenPanel.asientosVendidos -= asientos.vendidos
            state.resumenPanel.asientosTotales -= asientos.totales
          } else {
            lista[indice].estado = estado
          }
        }
        state.mensaje = mensaje
      })
      .addCase(cambiarEstadoVuelo.rejected, (state, action) => {
        state.error = action.error.message
      })
  },
})

export const { limpiarMensaje } = vuelosSlice.actions
export default vuelosSlice.reducer
